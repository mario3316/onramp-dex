export function TokenSelector({ tokens, selected, onChange, label }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <select
                value={selected.address}
                onChange={e => {
                    const token = tokens.find(t => t.address === e.target.value);
                    if (token) onChange(token);
                }}
                className="border px-2 py-1 w-full"
            >
                {tokens.map(token => (
                    <option key={token.address} value={token.address}>
                        {token.name} ({token.symbol})
                    </option>
                ))}
            </select>
        </div>
    );
} 