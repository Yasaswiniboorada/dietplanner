using System;
using System.Threading.Tasks;
using DietPlanner.Api.Attributes;
using DietPlanner.Api.Data;
using DietPlanner.Api.Models;
using DietPlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DietPlanner.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/profile")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IBmrCalculatorService _bmrCalculator;
        
        public ProfileController(ApplicationDbContext context, IBmrCalculatorService bmrCalculator)
        {
            _context = context;
            _bmrCalculator = bmrCalculator;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var profile = await _context.UserProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == user.Id);
                
            if (profile == null)
            {
                return NotFound(new { message = "Profile not found" });
            }
            
            return Ok(profile);
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateProfile([FromBody] UserProfile profile)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var existingProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == user.Id);
                
            if (existingProfile == null)
            {
                // Create new profile
                var newProfile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Age = profile.Age,
                    Gender = profile.Gender,
                    Height = profile.Height,
                    Weight = profile.Weight,
                    ActivityLevel = profile.ActivityLevel,
                    DietaryPreference = profile.DietaryPreference,
                    Goal = profile.Goal,
                    MealFrequency = profile.MealFrequency,
                    BodyFatPercentage = profile.BodyFatPercentage,
                    CreatedAt = DateTime.UtcNow
                };
                
                await _context.UserProfiles.AddAsync(newProfile);
                await _context.SaveChangesAsync();
                
                return CreatedAtAction(nameof(GetProfile), null, newProfile);
            }
            else
            {
                // Update existing profile
                existingProfile.Age = profile.Age;
                existingProfile.Gender = profile.Gender;
                existingProfile.Height = profile.Height;
                existingProfile.Weight = profile.Weight;
                existingProfile.ActivityLevel = profile.ActivityLevel;
                existingProfile.DietaryPreference = profile.DietaryPreference;
                existingProfile.Goal = profile.Goal;
                existingProfile.MealFrequency = profile.MealFrequency;
                existingProfile.BodyFatPercentage = profile.BodyFatPercentage;
                existingProfile.UpdatedAt = DateTime.UtcNow;
                
                _context.UserProfiles.Update(existingProfile);
                await _context.SaveChangesAsync();
                
                return Ok(existingProfile);
            }
        }
        
        [HttpGet("nutrition")]
        public async Task<IActionResult> GetNutritionInfo()
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var profile = await _context.UserProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == user.Id);
                
            if (profile == null)
            {
                return NotFound(new { message = "Profile not found" });
            }
            
            double bmr = _bmrCalculator.CalculateBmr(profile);
            double tdee = _bmrCalculator.CalculateTdee(profile);
            
            // Calculate target calories based on goal
            decimal targetCalories = profile.Goal.ToLower() switch
            {
                "lose weight" => (decimal)(tdee * 0.8), // 20% deficit
                "gain weight" => (decimal)(tdee * 1.2), // 20% surplus
                _ => (decimal)tdee // maintain weight
            };
            
            // Calculate macros (protein: 30%, carbs: 40%, fats: 30%)
            var macros = new
            {
                protein = targetCalories * 0.3m / 4m, // 4 calories per gram of protein
                carbs = targetCalories * 0.4m / 4m,   // 4 calories per gram of carbs
                fats = targetCalories * 0.3m / 9m     // 9 calories per gram of fat
            };
            
            return Ok(new
            {
                Bmr = bmr,
                Tdee = tdee,
                TargetCalories = targetCalories,
                Macros = new
                {
                    Protein = macros.protein,
                    Carbs = macros.carbs,
                    Fats = macros.fats
                }
            });
        }
    }
} 