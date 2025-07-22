using System;
using System.Linq;
using System.Threading.Tasks;
using DietPlanner.Api.Attributes;
using DietPlanner.Api.Data;
using DietPlanner.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DietPlanner.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/progress")]
    public class ProgressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public ProgressController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpPost("weight")]
        public async Task<IActionResult> AddWeightEntry([FromBody] WeightEntry entry)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var weightEntry = new WeightEntry
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Date = entry.Date,
                Weight = entry.Weight,
                Note = entry.Note,
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.WeightEntries.AddAsync(weightEntry);
            await _context.SaveChangesAsync();
            
            return Ok(weightEntry);
        }
        
        [HttpGet("weight/history")]
        public async Task<IActionResult> GetWeightHistory([FromQuery] string startDate, [FromQuery] string endDate)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var query = _context.WeightEntries
                .AsNoTracking()
                .Where(we => we.UserId == user.Id);
                
            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out DateTime parsedStartDate))
            {
                query = query.Where(we => we.Date >= parsedStartDate);
            }
            
            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out DateTime parsedEndDate))
            {
                query = query.Where(we => we.Date <= parsedEndDate);
            }
            
            var weightEntries = await query
                .OrderBy(we => we.Date)
                .ToListAsync();
                
            return Ok(weightEntries);
        }
        
        [HttpGet("compliance/history")]
        public async Task<IActionResult> GetComplianceHistory([FromQuery] string startDate, [FromQuery] string endDate)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            var query = _context.ComplianceEntries
                .AsNoTracking()
                .Where(ce => ce.UserId == user.Id);
                
            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out DateTime parsedStartDate))
            {
                query = query.Where(ce => ce.Date >= parsedStartDate);
            }
            
            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out DateTime parsedEndDate))
            {
                query = query.Where(ce => ce.Date <= parsedEndDate);
            }
            
            var complianceEntries = await query
                .OrderBy(ce => ce.Date)
                .ToListAsync();
                
            return Ok(complianceEntries);
        }
        
        [HttpGet("summary")]
        public async Task<IActionResult> GetProgressSummary([FromQuery] string startDate, [FromQuery] string endDate)
        {
            var user = (User)HttpContext.Items["User"];
            if (user == null)
            {
                return Unauthorized();
            }
            
            if (!DateTime.TryParse(startDate, out DateTime parsedStartDate) || !DateTime.TryParse(endDate, out DateTime parsedEndDate))
            {
                return BadRequest(new { message = "Invalid date format. Please use yyyy-MM-dd format." });
            }
            
            // Get weight entries for the period
            var weightEntries = await _context.WeightEntries
                .AsNoTracking()
                .Where(we => we.UserId == user.Id && we.Date >= parsedStartDate && we.Date <= parsedEndDate)
                .OrderBy(we => we.Date)
                .ToListAsync();
                
            if (!weightEntries.Any())
            {
                return NotFound(new { message = "No weight entries found for the specified period" });
            }
            
            var startWeight = weightEntries.First().Weight;
            var currentWeight = weightEntries.Last().Weight;
            var weightChange = currentWeight - startWeight;
            
            // Get compliance entries for the period
            var complianceEntries = await _context.ComplianceEntries
                .AsNoTracking()
                .Where(ce => ce.UserId == user.Id && ce.Date >= parsedStartDate && ce.Date <= parsedEndDate)
                .OrderBy(ce => ce.Date)
                .ToListAsync();
                
            var averageComplianceRate = complianceEntries.Any() 
                ? complianceEntries.Average(ce => ce.ComplianceRate)
                : 0;
                
            var summary = new
            {
                StartDate = startDate,
                EndDate = endDate,
                StartWeight = startWeight,
                CurrentWeight = currentWeight,
                WeightChange = weightChange,
                AverageComplianceRate = averageComplianceRate
            };
            
            return Ok(summary);
        }
    }
} 