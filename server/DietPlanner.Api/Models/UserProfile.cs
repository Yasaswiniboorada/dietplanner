using System;
using System.ComponentModel.DataAnnotations;

namespace DietPlanner.Api.Models
{
    public class UserProfile
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        
        [Required]
        [Range(15, 100)]
        public int Age { get; set; }
        
        [Required]
        public string Gender { get; set; }
        
        [Required]
        [Range(120, 250)]
        public decimal Height { get; set; } // in cm
        
        [Required]
        [Range(30, 300)]
        public decimal Weight { get; set; } // in kg
        
        [Required]
        public string ActivityLevel { get; set; }
        
        [Required]
        public string DietaryPreference { get; set; }
        
        [Required]
        public string Goal { get; set; }
        
        [Required]
        [Range(1, 3)]
        public int MealFrequency { get; set; }
        
        [Range(3, 70)]
        public decimal? BodyFatPercentage { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation property
        public User User { get; set; }
    }
} 