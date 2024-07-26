// .netlify/functions/admin.js

exports.handler = async function(event, context) {
    const path = event.path;
  
    if (path.includes('/admin/dashboard')) {
      // Handle dashboard logic
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Admin Dashboard" }),
      };
    }
    // Add more conditions for different admin paths
  
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Not found" }),
    };
  };
  