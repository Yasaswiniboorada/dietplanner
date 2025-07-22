using Microsoft.EntityFrameworkCore;
using DietPlanner.Api.Models;

namespace DietPlanner.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<FoodItem> FoodItems { get; set; }
        public DbSet<MealPlan> MealPlans { get; set; }
        public DbSet<Meal> Meals { get; set; }
        public DbSet<MealFoodItem> MealFoodItems { get; set; }
        public DbSet<WeightEntry> WeightEntries { get; set; }
        public DbSet<ComplianceEntry> ComplianceEntries { get; set; }
        public DbSet<MealItem> MealItems { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User -> UserProfile (1:1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Profile)
                .WithOne(p => p.User)
                .HasForeignKey<UserProfile>(p => p.UserId);
            
            // User -> MealPlan (1:N)
            modelBuilder.Entity<MealPlan>()
                .HasOne(mp => mp.User)
                .WithMany()
                .HasForeignKey(mp => mp.UserId);
            
            // MealPlan -> Meal (1:N)
            modelBuilder.Entity<Meal>()
                .HasOne(m => m.MealPlan)
                .WithMany(mp => mp.Meals)
                .HasForeignKey(m => m.MealPlanId);
            
            // Meal -> MealFoodItem (1:N)
            modelBuilder.Entity<MealFoodItem>()
                .HasOne(mfi => mfi.Meal)
                .WithMany(m => m.FoodItems)
                .HasForeignKey(mfi => mfi.MealId);
            
            // MealFoodItem -> FoodItem (N:1)
            modelBuilder.Entity<MealFoodItem>()
                .HasOne(mfi => mfi.FoodItem)
                .WithMany()
                .HasForeignKey(mfi => mfi.FoodItemId);
            
            // User -> WeightEntry (1:N)
            modelBuilder.Entity<WeightEntry>()
                .HasOne(we => we.User)
                .WithMany()
                .HasForeignKey(we => we.UserId);
            
            // User -> ComplianceEntry (1:N)
            modelBuilder.Entity<ComplianceEntry>()
                .HasOne(ce => ce.User)
                .WithMany()
                .HasForeignKey(ce => ce.UserId);
            
            // MealPlan -> ComplianceEntry (1:N)
            modelBuilder.Entity<ComplianceEntry>()
                .HasOne(ce => ce.MealPlan)
                .WithMany()
                .HasForeignKey(ce => ce.MealPlanId);
        }
    }
} 