using System;
using System.ComponentModel.DataAnnotations;

namespace DietPlanner.Api.Models
{
    public class FoodItem
    {
        public Guid Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        [Required]
        [Range(0, 1000)]
        public decimal Calories { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal Protein { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal Carbs { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal Fats { get; set; }
        
        [Required]
        public decimal ServingSize { get; set; }
        
        [Required]
        public string ServingUnit { get; set; }
        
        [Required]
        public string Category { get; set; }
        
        [Required]
        public bool IsVegetarian { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 