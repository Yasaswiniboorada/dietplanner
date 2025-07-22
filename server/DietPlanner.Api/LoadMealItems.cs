using System;
using System.IO;
using System.Threading.Tasks;
using DietPlanner.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DietPlanner.Api
{
    public class LoadMealItems
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("Starting meal items data loading process...");
            
            try
            {
                // Setup configuration
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false)
                    .AddEnvironmentVariables()
                    .Build();
                
                // Setup services
                var services = new ServiceCollection();
                
                // Configure logging
                services.AddLogging(builder =>
                {
                    builder.AddConsole();
                    builder.AddDebug();
                });
                
                // Configure database
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
                
                var serviceProvider = services.BuildServiceProvider();
                
                // Initialize database and seed data
                await SeedData.Initialize(serviceProvider);
                
                Console.WriteLine("Meal items loaded successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine(ex.StackTrace);
            }
        }
    }
} 