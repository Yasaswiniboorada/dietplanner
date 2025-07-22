using System;
using System.ComponentModel.DataAnnotations;

namespace DietPlanner.Api.Models
{
    public class WeightEntry
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        [Range(30, 300)]
        public decimal Weight { get; set; }
        
        public string Note { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        // Navigation property
        public User User { get; set; }
    }
    
    public class ComplianceEntry
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid MealPlanId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        public int MealsCompleted { get; set; }
        public int TotalMeals { get; set; }
        public decimal ComplianceRate { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public User User { get; set; }
        public MealPlan MealPlan { get; set; }
    }
} 