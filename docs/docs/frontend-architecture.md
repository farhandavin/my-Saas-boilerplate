```markdown
# Frontend Architecture

## React Query (TanStack Query)
We do not use `useEffect` for data fetching. Instead, we use **TanStack Query v5**.

### Why?
1.  **Automatic Caching:** Reduces server load.
2.  **Background Updates:** Keeps data fresh.
3.  **Loading/Error States:** Built-in flags like `isLoading` and `isError`.

### Creating a New Hook
All API hooks are stored in `src/hooks/queries`.

**Example: `useUserQuery.js`**

```javascript
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const useUserQuery = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
  });
};