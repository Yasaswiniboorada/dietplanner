using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using DietPlanner.Api.Controllers;
using DietPlanner.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DietPlanner.Api.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();
            
            try
            {
                context.Database.EnsureCreated();
                
                // Add seed data only if the database was created
                if (!context.FoodItems.Any())
                {
                    await SeedFoodItems(context);
                    logger.LogInformation("Food items seed data added successfully.");
                }
                
                // Always refresh meal items data to ensure we have the latest data
                // First remove existing meal items
                var existingMealItems = await context.MealItems.ToListAsync();
                if (existingMealItems.Any())
                {
                    context.MealItems.RemoveRange(existingMealItems);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Existing meal items removed.");
                }
                
                // Add meal items
                await SeedMealItems(context);
                logger.LogInformation("Meal items seed data added successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
            }
        }
        
        private static async Task SeedMealItems(ApplicationDbContext context)
        {
            try
            {
                // Path to the meal items JSON file
                string filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "MealItemsData.json");
                
                // If file doesn't exist, use hardcoded data
                if (!File.Exists(filePath))
                {
                    // Hardcoded meal items for seeding
                    var mealItemsJson = @"[
                        {
                            ""name"":""Moong Dal Chilla"",
                            ""type"":""Vegetarian"",
                            ""calories"":220,
                            ""protein"":14,
                            ""carbs"":20,
                            ""fats"":8,
                            ""category"":[
                                ""Weight Loss"",
                                ""Diabetic-Friendly""
                            ]
                        },
                        {
                            ""name"":""Quinoa Upma"",
                            ""type"":""Vegetarian"",
                            ""calories"":250,
                            ""protein"":8,
                            ""carbs"":35,
                            ""fats"":9,
                            ""category"":[
                                ""Diabetic-Friendly""
                            ]
                        },
                        {
                            ""name"":""Vegetable Oats Khichdi"",
                            ""type"":""Vegetarian"",
                            ""calories"":200,
                            ""protein"":7,
                            ""carbs"":32,
                            ""fats"":6,
                            ""category"":[
                                ""Weight Loss""
                            ]
                        }
                    ]";
                    
                    var mealItemDtos = JsonSerializer.Deserialize<List<MealItemDto>>(mealItemsJson);
                    await SeedMealItemsFromDto(context, mealItemDtos);
                }
                else
                {
                    // Read from JSON file
                    string jsonContent = await File.ReadAllTextAsync(filePath);
                    var mealItemDtos = JsonSerializer.Deserialize<List<MealItemDto>>(jsonContent);
                    await SeedMealItemsFromDto(context, mealItemDtos);
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error seeding meal items: " + ex.Message);
            }
        }
        
        private static async Task SeedMealItemsFromDto(ApplicationDbContext context, List<MealItemDto> mealItemDtos)
        {
            var mealItems = new List<MealItem>();
            
            foreach (var dto in mealItemDtos)
            {
                var mealItem = new MealItem
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name,
                    Type = dto.Type,
                    Calories = dto.Calories,
                    Protein = dto.Protein,
                    Carbs = dto.Carbs,
                    Fats = dto.Fats,
                    Categories = dto.Category ?? new List<string>(),
                    CreatedAt = DateTime.UtcNow
                };
                
                mealItems.Add(mealItem);
            }
            
            await context.MealItems.AddRangeAsync(mealItems);
            await context.SaveChangesAsync();
        }
        
        private static async Task SeedFoodItems(ApplicationDbContext context)
        {
            var foodItems = new List<FoodItem>
            {
                // Proteins
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Chicken Breast",
                    Calories = 165,
                    Protein = 31,
                    Carbs = 0,
                    Fats = 3.6m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Protein",
                    IsVegetarian = false,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Salmon",
                    Calories = 208,
                    Protein = 20,
                    Carbs = 0,
                    Fats = 13,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Protein",
                    IsVegetarian = false,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Tofu",
                    Calories = 76,
                    Protein = 8,
                    Carbs = 1.9m,
                    Fats = 4.8m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Protein",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Eggs",
                    Calories = 78,
                    Protein = 6.3m,
                    Carbs = 0.6m,
                    Fats = 5.3m,
                    ServingSize = 50,
                    ServingUnit = "g",
                    Category = "Protein",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Carbohydrates
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Brown Rice",
                    Calories = 112,
                    Protein = 2.6m,
                    Carbs = 23.5m,
                    Fats = 0.9m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Carbohydrates",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Sweet Potato",
                    Calories = 86,
                    Protein = 1.6m,
                    Carbs = 20.1m,
                    Fats = 0.1m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Carbohydrates",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Quinoa",
                    Calories = 120,
                    Protein = 4.4m,
                    Carbs = 21.3m,
                    Fats = 1.9m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Carbohydrates",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Oatmeal",
                    Calories = 68,
                    Protein = 2.4m,
                    Carbs = 12,
                    Fats = 1.4m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Carbohydrates",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Fruits
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Banana",
                    Calories = 89,
                    Protein = 1.1m,
                    Carbs = 22.8m,
                    Fats = 0.3m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Fruits",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Apple",
                    Calories = 52,
                    Protein = 0.3m,
                    Carbs = 13.8m,
                    Fats = 0.2m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Fruits",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Vegetables
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Broccoli",
                    Calories = 34,
                    Protein = 2.8m,
                    Carbs = 6.6m,
                    Fats = 0.4m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Vegetables",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Spinach",
                    Calories = 23,
                    Protein = 2.9m,
                    Carbs = 3.6m,
                    Fats = 0.4m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Vegetables",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Dairy
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Greek Yogurt",
                    Calories = 59,
                    Protein = 10,
                    Carbs = 3.6m,
                    Fats = 0.4m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Dairy",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Cottage Cheese",
                    Calories = 98,
                    Protein = 11.1m,
                    Carbs = 3.4m,
                    Fats = 4.3m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Dairy",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                
                // Fats
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Avocado",
                    Calories = 160,
                    Protein = 2,
                    Carbs = 8.5m,
                    Fats = 14.7m,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Fats",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                },
                new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Name = "Olive Oil",
                    Calories = 884,
                    Protein = 0,
                    Carbs = 0,
                    Fats = 100,
                    ServingSize = 100,
                    ServingUnit = "g",
                    Category = "Fats",
                    IsVegetarian = true,
                    CreatedAt = DateTime.UtcNow
                }
            };
            
            await context.FoodItems.AddRangeAsync(foodItems);
            await context.SaveChangesAsync();
        }
    }
} 