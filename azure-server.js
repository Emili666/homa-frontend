const express = require('express');
const path = require('path');
const app = express();

// Servir archivos estaticos desde el mismo directorio
app.use(express.static(__dirname));

// Todas las demas rutas redirigen al index.html de Angular
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
