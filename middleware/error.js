// const errorHandler = (err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send({ error: 'Something went wrong!' });
//   };

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  res.status(500).send({ error: 'Something went wrong!' });
}; 
  
  const notFound = (req, res, next) => {
    res.status(404).send({ error: 'Not found' });
  };
  
  module.exports = { errorHandler, notFound };