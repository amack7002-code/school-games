export default async (request) => {
  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId');
  const name = url.searchParams.get('name') || 'hi';

  if (!gameId) {
    return new Response('Missing Game ID', { status: 400 });
  }

  const response = await fetch('https://api.blooket.com/api/firebase/join', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: gameId, name }),
  });

  return new Response(await response.text(), { status: response.status });
};   
