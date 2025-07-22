using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DietPlanner.Api.Attributes;
using DietPlanner.Api.Data;
using DietPlanner.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DietPlanner.Api.Controllers
{
    [ApiController]
    [Route("api/meal-items")]
    public class MealItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public MealItemController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetMealItems([FromQuery] string type = null, [FromQuery] string category = null)
        {
            var query = _context.MealItems.AsNoTracking();
            
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(m => m.Type == type);
            }
            
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(m => m.CategoriesString.Contains(category));
            }
            
            var mealItems = await query.ToListAsync();
            return Ok(mealItems);
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMealItem(Guid id)
        {
            var mealItem = await _context.MealItems
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);
                
            if (mealItem == null)
            {
                return NotFound();
            }
            
            return Ok(mealItem);
        }
        
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var mealItems = await _context.MealItems
                .AsNoTracking()
                .Select(m => m.CategoriesString)
                .Where(c => !string.IsNullOrEmpty(c))
                .ToListAsync();
                
            var categories = new HashSet<string>();
            
            foreach (var categoryString in mealItems)
            {
                var itemCategories = categoryString.Split(',');
                foreach (var category in itemCategories)
                {
                    categories.Add(category.Trim());
                }
            }
            
            return Ok(categories.ToList());
        }
        
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] List<MealItemDto> mealItems)
        {
            var newMealItems = new List<MealItem>();
            
            foreach (var item in mealItems)
            {
                var mealItem = new MealItem
                {
                    Id = Guid.NewGuid(),
                    Name = item.Name,
                    Type = item.Type,
                    Calories = item.Calories,
                    Protein = item.Protein,
                    Carbs = item.Carbs,
                    Fats = item.Fats,
                    Categories = item.Category,
                    CreatedAt = DateTime.UtcNow
                };
                
                newMealItems.Add(mealItem);
            }
            
            await _context.MealItems.AddRangeAsync(newMealItems);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = $"Added {newMealItems.Count} meal items" });
        }
        
        [HttpGet("recommendations")]
        public async Task<IActionResult> RecommendMeals([FromQuery] string goal, [FromQuery] string type = null, [FromQuery] int count = 3)
        {
            var query = _context.MealItems.AsNoTracking();
            
            if (!string.IsNullOrEmpty(goal))
            {
                query = query.Where(m => m.CategoriesString.Contains(goal));
            }
            
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(m => m.Type == type);
            }
            
            // Get all matching items
            var matchingItems = await query.ToListAsync();
            
            if (!matchingItems.Any())
            {
                return NotFound(new { message = "No matching meal items found" });
            }
            
            // Select random items up to the requested count
            var random = new Random();
            var recommendedItems = matchingItems
                .OrderBy(x => random.Next())
                .Take(Math.Min(count, matchingItems.Count))
                .ToList();
            
            return Ok(recommendedItems);
        }
        
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateMealItem([FromBody] MealItemDto mealItem)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var newMealItem = new MealItem
            {
                Id = Guid.NewGuid(),
                Name = mealItem.Name,
                Type = mealItem.Type,
                Calories = mealItem.Calories,
                Protein = mealItem.Protein,
                Carbs = mealItem.Carbs,
                Fats = mealItem.Fats,
                Categories = mealItem.Category,
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.MealItems.AddAsync(newMealItem);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetMealItem), new { id = newMealItem.Id }, newMealItem);
        }
        
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMealItem(Guid id)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var mealItem = await _context.MealItems.FindAsync(id);
            if (mealItem == null)
            {
                return NotFound();
            }
            
            _context.MealItems.Remove(mealItem);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
    
    public class MealItemDto
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public decimal Calories { get; set; }
        public decimal Protein { get; set; }
        public decimal Carbs { get; set; }
        public decimal Fats { get; set; }
        public List<string> Category { get; set; }
    }
} 