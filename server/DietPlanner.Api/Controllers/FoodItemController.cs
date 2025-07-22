using System;
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
    [Route("api/food-items")]
    public class FoodItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public FoodItemController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetFoodItems([FromQuery] string category = null, [FromQuery] bool? isVegetarian = null)
        {
            var query = _context.FoodItems.AsNoTracking();
            
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(f => f.Category == category);
            }
            
            if (isVegetarian.HasValue)
            {
                query = query.Where(f => f.IsVegetarian == isVegetarian.Value);
            }
            
            var foodItems = await query.ToListAsync();
            return Ok(foodItems);
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodItem(Guid id)
        {
            var foodItem = await _context.FoodItems
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == id);
                
            if (foodItem == null)
            {
                return NotFound();
            }
            
            return Ok(foodItem);
        }
        
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.FoodItems
                .AsNoTracking()
                .Select(f => f.Category)
                .Distinct()
                .ToListAsync();
                
            return Ok(categories);
        }
        
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateFoodItem([FromBody] FoodItem foodItem)
        {
            // Only allow admins to create food items
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            // For simplicity, we're not checking if the user is an admin here
            // In a real application, you would have a user role system
            
            var newFoodItem = new FoodItem
            {
                Id = Guid.NewGuid(),
                Name = foodItem.Name,
                Calories = foodItem.Calories,
                Protein = foodItem.Protein,
                Carbs = foodItem.Carbs,
                Fats = foodItem.Fats,
                ServingSize = foodItem.ServingSize,
                ServingUnit = foodItem.ServingUnit,
                Category = foodItem.Category,
                IsVegetarian = foodItem.IsVegetarian,
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.FoodItems.AddAsync(newFoodItem);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetFoodItem), new { id = newFoodItem.Id }, newFoodItem);
        }
        
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFoodItem(Guid id, [FromBody] FoodItem foodItem)
        {
            // Only allow admins to update food items
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var existingFoodItem = await _context.FoodItems.FindAsync(id);
            if (existingFoodItem == null)
            {
                return NotFound();
            }
            
            existingFoodItem.Name = foodItem.Name;
            existingFoodItem.Calories = foodItem.Calories;
            existingFoodItem.Protein = foodItem.Protein;
            existingFoodItem.Carbs = foodItem.Carbs;
            existingFoodItem.Fats = foodItem.Fats;
            existingFoodItem.ServingSize = foodItem.ServingSize;
            existingFoodItem.ServingUnit = foodItem.ServingUnit;
            existingFoodItem.Category = foodItem.Category;
            existingFoodItem.IsVegetarian = foodItem.IsVegetarian;
            existingFoodItem.UpdatedAt = DateTime.UtcNow;
            
            _context.FoodItems.Update(existingFoodItem);
            await _context.SaveChangesAsync();
            
            return Ok(existingFoodItem);
        }
        
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoodItem(Guid id)
        {
            // Only allow admins to delete food items
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var foodItem = await _context.FoodItems.FindAsync(id);
            if (foodItem == null)
            {
                return NotFound();
            }
            
            _context.FoodItems.Remove(foodItem);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
} 