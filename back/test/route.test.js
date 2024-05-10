const request = require('supertest');
const app = require('../main.js'); // Assurez-vous d'importer correctement votre application Express

describe("Test de la route GET /api/produits", () => {
    it("Devrait retourner le statut 200 et une liste de produits", async () => {
        const response = await request(app).get('/api/produits');
        
        // Vérifie le statut de la réponse
        expect(response.status).toBe(200);

        // Vérifie le contenu de la réponse
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('produits');
        expect(Array.isArray(response.body.produits)).toBe(true);
    });const request = require('supertest');
    const app = require('../main.js');
    
    describe("Test de la route GET /api/produits", () => {
        it("Devrait retourner le statut 200 et une liste de produits", async () => {
            // Envoie une requête GET à la route /api/produits
            const response = await request(app).get('/api/produits');
    
            // Vérifie le statut de la réponse
            expect(response.status).toBe(200);
    
            // Vérifie le contenu de la réponse
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('produits');
            expect(response.body.produits).toBeInstanceOf(Array);
        });
    });
    
});
