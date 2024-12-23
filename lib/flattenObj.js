function flattenObject(obj, prefix = "") {
    const flattened = {};
  
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
  
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          // Recursively flatten for nested objects
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          // Handle arrays by indexing keys
          value.forEach((item, index) => {
            Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
          });
        } else {
          // Directly assign primitive values
          flattened[newKey] = value;
        }
      }
    }
  
    return flattened;
  }
  
  // Example usage
  const exampleData = {
    
  }
  
  const flattenedData = flattenObject(exampleData);
  console.log(flattenedData);
  