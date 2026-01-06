const { db } = require('../config/firebase');

const MOCK_CATEGORIES = [
    { id: '1', name: 'Pop', imageUrl: 'https://placehold.co/200/e91e63/white?text=Pop' },
    { id: '2', name: 'Rock', imageUrl: 'https://placehold.co/200/673ab7/white?text=Rock' },
    { id: '3', name: 'HipHop', imageUrl: 'https://placehold.co/200/ff5722/white?text=Hip+Hop' },
    { id: '4', name: 'Electronic', imageUrl: 'https://placehold.co/200/00bcd4/white?text=Electronic' },
    { id: '5', name: 'R&B', imageUrl: 'https://placehold.co/200/9c27b0/white?text=R%26B' },
    { id: '6', name: 'Jazz', imageUrl: 'https://placehold.co/200/795548/white?text=Jazz' },
    { id: '7', name: 'Classical', imageUrl: 'https://placehold.co/200/607d8b/white?text=Classical' },
    { id: '8', name: 'Country', imageUrl: 'https://placehold.co/200/8bc34a/white?text=Country' },
    { id: '9', name: 'Metal', imageUrl: 'https://placehold.co/200/212121/white?text=Metal' },
    { id: '10', name: 'Folk', imageUrl: 'https://placehold.co/200/cddc39/white?text=Folk' },
    { id: '11', name: 'Blues', imageUrl: 'https://placehold.co/200/2196f3/white?text=Blues' },
    { id: '12', name: 'Reggae', imageUrl: 'https://placehold.co/200/4caf50/white?text=Reggae' },
    { id: '13', name: 'Latin', imageUrl: 'https://placehold.co/200/ff9800/white?text=Latin' },
    { id: '14', name: 'Indie', imageUrl: 'https://placehold.co/200/3f51b5/white?text=Indie' },
    { id: '15', name: 'K-Pop', imageUrl: 'https://placehold.co/200/f06292/white?text=K-Pop' }
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
