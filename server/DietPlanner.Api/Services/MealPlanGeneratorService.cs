using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DietPlanner.Api.Data;
using DietPlanner.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DietPlanner.Api.Services
{
    public interface IMealPlanGeneratorService
    {
        Task<MealPlan> GenerateMealPlan(Guid userId, DateTime date);
    }
    
    public class MealPlanGeneratorService : IMealPlanGeneratorService
    {
        private readonly ApplicationDbContext _context;
        private readonly IBmrCalculatorService _bmrCalculator;
        private readonly Random _random;
        
        public MealPlanGeneratorService(
            ApplicationDbContext context,
            IBmrCalculatorService bmrCalculator)
        {
            _context = context;
            _bmrCalculator = bmrCalculator;
            _random = new Random();
        }
        
        public async Task<MealPlan> GenerateMealPlan(Guid userId, DateTime date)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);
                
            if (user == null || user.Profile == null)
                throw new ArgumentException("User or profile not found");
            
            // Calculate BMR and TDEE
            double bmr = _bmrCalculator.CalculateBmr(user.Profile);
            double tdee = _bmrCalculator.CalculateTdee(user.Profile);
            
            // Calculate target calories based on goal
            decimal targetCalories = user.Profile.Goal.ToLower() switch
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
            
            // Create meal plan
            var mealPlan = new MealPlan
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Date = date,
                Meals = new List<Meal>(),
                CreatedAt = DateTime.UtcNow
            };
            
            // Get available food items based on dietary preference
            var foodItems = await _context.FoodItems
                .Where(f => user.Profile.DietaryPreference == "non-veg" || f.IsVegetarian)
                .ToListAsync();
            
            // Generate meals based on meal frequency
            var mealTypes = user.Profile.MealFrequency switch
            {
                1 => new[] { "lunch" },
                2 => new[] { "breakfast", "dinner" },
                _ => new[] { "breakfast", "lunch", "dinner" }
            };
            
            // Calculate calories per meal
            decimal caloriesPerMeal = targetCalories / mealTypes.Length;
            decimal proteinPerMeal = macros.protein / mealTypes.Length;
            decimal carbsPerMeal = macros.carbs / mealTypes.Length;
            decimal fatsPerMeal = macros.fats / mealTypes.Length;
            
            foreach (var mealType in mealTypes)
            {
                var meal = GenerateMeal(
                    mealPlan.Id,
                    mealType,
                    caloriesPerMeal,
                    proteinPerMeal,
                    carbsPerMeal,
                    fatsPerMeal,
                    foodItems
                );
                
                mealPlan.Meals.Add(meal);
            }
            
            // Calculate totals
            mealPlan.TotalCalories = mealPlan.Meals.Sum(m => m.TotalCalories);
            mealPlan.TotalProtein = mealPlan.Meals.Sum(m => m.TotalProtein);
            mealPlan.TotalCarbs = mealPlan.Meals.Sum(m => m.TotalCarbs);
            mealPlan.TotalFats = mealPlan.Meals.Sum(m => m.TotalFats);
            
            return mealPlan;
        }
        
        private Meal GenerateMeal(
            Guid mealPlanId,
            string type,
            decimal targetCalories,
            decimal targetProtein,
            decimal targetCarbs,
            decimal targetFats,
            List<FoodItem> availableFoodItems)
        {
            var meal = new Meal
            {
                Id = Guid.NewGuid(),
                MealPlanId = mealPlanId,
                Type = type,
                FoodItems = new List<MealFoodItem>()
            };
            
            // Simple algorithm to select food items
            // This can be improved with more sophisticated selection logic
            while (meal.TotalCalories < targetCalories * 0.9m &&
                   meal.FoodItems.Count < 5)
            {
                var foodItem = availableFoodItems[_random.Next(availableFoodItems.Count)];
                
                // Calculate quantity needed
                decimal quantity = 1;
                if (meal.TotalCalories + (foodItem.Calories * quantity) <= targetCalories * 1.1m)
                {
                    var mealFoodItem = new MealFoodItem
                    {
                        Id = Guid.NewGuid(),
                        MealId = meal.Id,
                        FoodItemId = foodItem.Id,
                        FoodItem = foodItem,
                        Quantity = quantity
                    };
                    
                    meal.FoodItems.Add(mealFoodItem);
                    
                    // Update meal totals
                    meal.TotalCalories += foodItem.Calories * quantity;
                    meal.TotalProtein += foodItem.Protein * quantity;
                    meal.TotalCarbs += foodItem.Carbs * quantity;
                    meal.TotalFats += foodItem.Fats * quantity;
                }
            }
            
            return meal;
        }
    }
} 