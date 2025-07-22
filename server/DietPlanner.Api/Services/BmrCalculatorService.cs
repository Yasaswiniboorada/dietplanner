using DietPlanner.Api.Models;

namespace DietPlanner.Api.Services;

public interface IBmrCalculatorService
{
    double CalculateBmr(UserProfile profile);
    double CalculateTdee(UserProfile profile);
}

public class BmrCalculatorService : IBmrCalculatorService
{
    public double CalculateBmr(UserProfile profile)
    {
        // Mifflin-St Jeor Equation
        double bmr;
        double weight = (double)profile.Weight;
        double height = (double)profile.Height;
        
        if (profile.Gender.ToLower() == "male")
        {
            bmr = (10 * weight) + (6.25 * height) - (5 * profile.Age) + 5;
        }
        else
        {
            bmr = (10 * weight) + (6.25 * height) - (5 * profile.Age) - 161;
        }
        
        return bmr;
    }

    public double CalculateTdee(UserProfile profile)
    {
        double activityMultiplier = profile.ActivityLevel.ToLower() switch
        {
            "sedentary" => 1.2,
            "lightly active" => 1.375,
            "moderately active" => 1.55,
            "very active" => 1.725,
            "extra active" => 1.9,
            _ => 1.2
        };

        return CalculateBmr(profile) * activityMultiplier;
    }
} 