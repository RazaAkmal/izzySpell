#!/bin/bash

# Migration Script for AI Timer Features
# Run this when your database is available

echo "🚀 Starting AI Timer Features Migration..."

echo "📋 Step 1: Running Prisma migration..."
npx prisma migrate dev --name add_ai_suggested_time_durations

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    
    echo "📋 Step 2: Regenerating Prisma client..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Prisma client regenerated successfully!"
        
        echo "📋 Step 3: Instructions to enable AI features..."
        echo "Now you need to uncomment the code in AiService.ts:"
        echo "1. Open src/app/actions/AiService.ts"
        echo "2. Uncomment the database save operations in saveTimeDurationsToList()"
        echo "3. Uncomment the database query in getTimeDurationsForList()"
        echo "4. Remove the temporary return statements"
        
        echo "🎉 Migration complete! AI timer features will be fully functional after uncommenting the code."
    else
        echo "❌ Failed to regenerate Prisma client. Please run 'npx prisma generate' manually."
    fi
else
    echo "❌ Migration failed. Please check your database connection and try again."
fi
