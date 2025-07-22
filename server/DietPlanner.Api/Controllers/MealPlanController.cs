using System;
using System.Threading.Tasks;
using DietPlanner.Api.Attributes;
using DietPlanner.Api.Data;
using DietPlanner.Api.Models;
using DietPlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DietPlanner.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/meal-plans")]
    public class MealPlanController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMealPlanGeneratorService _mealPlanGenerator;
        
        public MealPlanController(ApplicationDbContext context, IMealPlanGeneratorService mealPlanGenerator)
        {
            _context = context;
            _mealPlanGenerator = mealPlanGenerator;
        }
        
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentPlan()
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var today = DateTime.UtcNow.Date;
            var mealPlan = await _context.MealPlans
                .AsNoTracking()
                .Include(mp => mp.Meals)
                    .ThenInclude(m => m.FoodItems)
                        .ThenInclude(mfi => mfi.FoodItem)
                .FirstOrDefaultAsync(mp => mp.UserId == user.Id && mp.Date.Date == today);
                
            if (mealPlan == null)
            {
                // No meal plan for today, generate a new one
                mealPlan = await _mealPlanGenerator.GenerateMealPlan(user.Id, today);
                
                // Save to database
                await _context.MealPlans.AddAsync(mealPlan);
                await _context.SaveChangesAsync();
            }
            
            return Ok(mealPlan);
        }
        
        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePlan()
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var today = DateTime.UtcNow.Date;
            
            // Delete existing meal plan for today if exists
            var existingPlan = await _context.MealPlans
                .Include(mp => mp.Meals)
                    .ThenInclude(m => m.FoodItems)
                .FirstOrDefaultAsync(mp => mp.UserId == user.Id && mp.Date.Date == today);
                
            if (existingPlan != null)
            {
                _context.MealPlans.Remove(existingPlan);
                await _context.SaveChangesAsync();
            }
            
            // Generate new meal plan
            var mealPlan = await _mealPlanGenerator.GenerateMealPlan(user.Id, today);
            
            // Save to database
            await _context.MealPlans.AddAsync(mealPlan);
            await _context.SaveChangesAsync();
            
            return Ok(mealPlan);
        }
        
        [HttpPost("{mealPlanId}/meals/{mealId}/complete")]
        public async Task<IActionResult> MarkMealCompleted(Guid mealPlanId, Guid mealId)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var meal = await _context.Meals
                .Include(m => m.MealPlan)
                .FirstOrDefaultAsync(m => m.Id == mealId && m.MealPlanId == mealPlanId);
                
            if (meal == null)
            {
                return NotFound(new { message = "Meal not found" });
            }
            
            if (meal.MealPlan.UserId != user.Id)
            {
                return Forbid();
            }
            
            meal.Completed = true;
            
            // Check if all meals are completed
            var allMealsInPlan = await _context.Meals
                .Where(m => m.MealPlanId == mealPlanId)
                .ToListAsync();
                
            if (allMealsInPlan.All(m => m.Completed))
            {
                meal.MealPlan.Completed = true;
                
                // Create compliance entry
                var complianceEntry = new ComplianceEntry
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    MealPlanId = mealPlanId,
                    Date = DateTime.UtcNow.Date,
                    MealsCompleted = allMealsInPlan.Count(m => m.Completed),
                    TotalMeals = allMealsInPlan.Count,
                    ComplianceRate = (decimal)allMealsInPlan.Count(m => m.Completed) / allMealsInPlan.Count,
                    CreatedAt = DateTime.UtcNow
                };
                
                await _context.ComplianceEntries.AddAsync(complianceEntry);
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Meal marked as completed" });
        }
        
        [HttpGet("history")]
        public async Task<IActionResult> GetMealPlanHistory([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var query = _context.MealPlans
                .AsNoTracking()
                .Include(mp => mp.Meals)
                .Where(mp => mp.UserId == user.Id);
                
            if (startDate.HasValue)
            {
                query = query.Where(mp => mp.Date >= startDate.Value);
            }
            
            if (endDate.HasValue)
            {
                query = query.Where(mp => mp.Date <= endDate.Value);
            }
            
            var mealPlans = await query
                .OrderByDescending(mp => mp.Date)
                .ToListAsync();
                
            return Ok(mealPlans);
        }
    }
} 