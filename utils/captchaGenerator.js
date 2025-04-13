const generateCaptcha = (difficulty = 'easy') => {
    let min, max;
    
    switch (difficulty) {
      case 'medium':
        min = 1;
        max = 50;
        break;
      case 'hard':
        min = 1;
        max = 100;
        break;
      default: // easy
        min = 1;
        max = 10;
    }
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  module.exports = { generateCaptcha };