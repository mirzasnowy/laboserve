import { Hono } from 'hono';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../client/lib/firebase'; // Adjust the path to your firebase config

const history = new Hono();

history.get('/:userId', async (c) => {
  const userId = c.req.param('userId');

  if (!userId) {
    return c.json({ error: 'User ID is required' }, 400);
  }

  try {
    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reservations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return c.json(reservations);
  } catch (error) {
    console.error('Error fetching reservation history:', error);
    return c.json({ error: 'Failed to fetch reservation history' }, 500);
  }
});

export default history;
