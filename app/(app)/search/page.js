import { requireUser } from '@/lib/auth/guards';
import { searchAll } from '@/lib/db/search';
import { SearchForm } from '@/components/SearchForm';
import { SearchResults } from '@/components/SearchResults';

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = (params?.q ?? '').trim();

  let results = { logs: [], wins: [] };
  if (query) {
    const user = await requireUser();
    try {
      results = await searchAll(user.id, query);
    } catch {
      results = { logs: [], wins: [] };
    }
  } else {
    await requireUser();
  }

  return (
    <section className="space-y-6">
      <h2 className="text-text text-2xl font-semibold">Search</h2>
      <SearchForm initialQuery={query} />
      {query && <SearchResults results={results} query={query} />}
    </section>
  );
}
