using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DietPlanner.Api.Models
{
    public class MealItem
    {
        public Guid Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        [Required]
        public string Type { get; set; } // Vegetarian or Non-Vegetarian
        
        [Required]
        public decimal Calories { get; set; }
        
        [Required]
        public decimal Protein { get; set; }
        
        [Required]
        public decimal Carbs { get; set; }
        
        [Required]
        public decimal Fats { get; set; }
        
        // Store categories as a comma-separated string, e.g. "Weight Loss,Diabetic-Friendly"
        public string CategoriesString { get; set; }
        
        [NotMapped]
        public List<string> Categories 
        { 
            get => string.IsNullOrEmpty(CategoriesString) 
                ? new List<string>() 
                : new List<string>(CategoriesString.Split(','));
            set => CategoriesString = value != null ? string.Join(",", value) : null;
        }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 