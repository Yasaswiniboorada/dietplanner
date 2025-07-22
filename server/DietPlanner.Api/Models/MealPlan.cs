using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DietPlanner.Api.Models
{
    public class MealPlan
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        public decimal TotalCalories { get; set; }
        public decimal TotalProtein { get; set; }
        public decimal TotalCarbs { get; set; }
        public decimal TotalFats { get; set; }
        
        public bool Completed { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public User User { get; set; }
        public ICollection<Meal> Meals { get; set; }
    }
    
    public class Meal
    {
        public Guid Id { get; set; }
        public Guid MealPlanId { get; set; }
        
        [Required]
        public string Type { get; set; } // breakfast, lunch, dinner
        
        public decimal TotalCalories { get; set; }
        public decimal TotalProtein { get; set; }
        public decimal TotalCarbs { get; set; }
        public decimal TotalFats { get; set; }
        
        public bool Completed { get; set; }
        
        // Navigation properties
        public MealPlan MealPlan { get; set; }
        public ICollection<MealFoodItem> FoodItems { get; set; }
    }
    
    public class MealFoodItem
    {
        public Guid Id { get; set; }
        public Guid MealId { get; set; }
        public Guid FoodItemId { get; set; }
        
        [Required]
        [Range(0.1, 1000)]
        public decimal Quantity { get; set; }
        
        // Navigation properties
        public Meal Meal { get; set; }
        public FoodItem FoodItem { get; set; }
    }
} 