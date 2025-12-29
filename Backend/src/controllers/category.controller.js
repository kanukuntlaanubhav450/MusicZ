const { db } = require('../config/firebase');

const MOCK_CATEGORIES = [
    { id: '1', name: 'Pop', imageUrl: 'https://placehold.co/200?text=Pop' },
    { id: '2', name: 'Electronic', imageUrl: 'https://placehold.co/200?text=Electronic' },
    { id: '3', name: 'Rock', imageUrl: 'https://placehold.co/200?text=Rock' },
    { id: '4', name: 'Hip Hop', imageUrl: 'https://placehold.co/200?text=HipHop' },
    { id: '5', name: 'Jazz', imageUrl: 'https://placehold.co/200?text=Jazz' },
    { id: '6', name: 'Classical', imageUrl: 'https://placehold.co/200?text=Classical' }
];

exports.getAllCategories = async (req, res) => {
    try {
        if (db) {
            const snapshot = await db.collection('categories').get();
            const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (categories.length === 0) {
                return res.json(MOCK_CATEGORIES);
            }
            return res.json(categories);
        } else {
            res.json(MOCK_CATEGORIES);
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
