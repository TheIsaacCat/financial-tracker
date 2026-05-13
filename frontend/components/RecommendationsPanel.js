function money(value) {
  return Number.parseFloat(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

export default function RecommendationsPanel({ recommendations }) {
  const items = recommendations?.recommendations || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Recommendations</h2>
      <div className="space-y-4">
        {items.map((recommendation) => (
          <div key={`${recommendation.title}-${recommendation.category}`} className="border-l-4 border-green-600 pl-4">
            <p className="font-semibold">{recommendation.title}</p>
            <p className="text-sm text-gray-600">{recommendation.message}</p>
            {recommendation.potentialSavings > 0 && (
              <p className="text-sm text-green-700 mt-1">
                Potential monthly savings: {money(recommendation.potentialSavings)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
