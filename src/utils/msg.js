const generateMsg = (text, username) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMsg };
