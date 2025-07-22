const fs = require('fs');
const { Client } = require('pg');
const path = require('path');

// Database connection string from command line argument or default
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Jq6fUMzIe0VT@ep-cool-king-a5gho4sa-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Path to meal items data
const mealItemsPath = path.join(__dirname, 'DietPlanner.Api', 'Data', 'MealItemsData.json');

async function loadMealItems() {
  console.log('Starting meal items data loading process...');
  
  // Create a client
  const client = new Client({
    connectionString
  });
  
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');
    
    // Check if the MealItems table exists
    const checkTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'MealItems'
      );
    `);
    
    const tableExists = checkTableResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('MealItems table does not exist. Creating it now...');
      
      // Create the MealItems table
      await client.query(`
        CREATE TABLE "MealItems" (
          "Id" UUID PRIMARY KEY,
          "Name" VARCHAR(255) NOT NULL,
          "Type" VARCHAR(50) NOT NULL,
          "Calories" DECIMAL NOT NULL,
          "Protein" DECIMAL NOT NULL,
          "Carbs" DECIMAL NOT NULL,
          "Fats" DECIMAL NOT NULL,
          "Categories" JSONB,
          "CreatedAt" TIMESTAMP NOT NULL
        );
      `);
      
      console.log('MealItems table created successfully.');
    } else {
      // Clear existing meal items
      await client.query('DELETE FROM "MealItems"');
      console.log('Cleared existing meal items');
    }
    
    // Read meal items data
    const data = fs.readFileSync(mealItemsPath, 'utf8');
    const mealItems = JSON.parse(data);
    
    console.log(`Found ${mealItems.length} meal items to import`);
    
    // Insert new meal items
    for (const item of mealItems) {
      const id = generateUUID();
      const categories = JSON.stringify(item.category || []);
      
      await client.query(`
        INSERT INTO "MealItems" ("Id", "Name", "Type", "Calories", "Protein", "Carbs", "Fats", "Categories", "CreatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        id,
        item.name,
        item.type,
        item.calories,
        item.protein,
        item.carbs,
        item.fats,
        categories,
        new Date()
      ]);
    }
    
    console.log(`Successfully imported ${mealItems.length} meal items`);
  } catch (error) {
    console.error('Error loading meal items:', error);
  } finally {
    // Close connection
    await client.end();
  }
}

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Run the function
loadMealItems().catch(console.error); 