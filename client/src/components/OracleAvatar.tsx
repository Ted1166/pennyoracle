export function OracleAvatar() {
    return (
        <svg viewBox="0 0 120 120" className="oracle-avatar" aria-hidden="true">
            <circle cx="60" cy="60" r="54" fill="url(#coinGradient)" stroke="#7A4423" strokeWidth="3" />
            <path
                d="M60 34c-14 0-24 12-24 26 0 10 6 17 14 22l2 10h16l2-10c8-5 14-12 14-22 0-14-10-26-24-26z"
                fill="#1D1930"
                opacity="0.85"
            />
            <circle cx="60" cy="58" r="6" fill="#F0EAFF" />
            <defs>
                <radialGradient id="coinGradient" cx="35%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#E3A26D" />
                    <stop offset="100%" stopColor="#B5652E" />
                </radialGradient>
            </defs>
        </svg>
    );
}
