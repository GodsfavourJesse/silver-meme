"use client";

interface VehicleSilhouetteProps {
    assetId: string;
    className?: string;
}

type VehicleShape = {
    body: string;
    windows: string;
    wheels: number[];
};

const VEHICLE_SHAPES: Record<string, VehicleShape> = {
    "vehicle-silhouette-01": {
        body: "M28 73 L36 57 L65 52 L87 32 L143 32 L169 53 L194 59 L205 73 L205 88 L28 88 Z",
        windows: "M78 52 L96 37 L118 37 L118 52 Z M125 37 L140 37 L158 52 L125 52 Z",
        wheels: [62, 164],
    },

    "vehicle-silhouette-02": {
        body: "M24 70 L35 49 L64 43 L81 25 L150 25 L174 44 L195 52 L208 70 L208 88 L24 88 Z",
        windows: "M76 44 L90 30 L117 30 L117 44 Z M125 30 L146 30 L163 44 L125 44 Z",
        wheels: [60, 169],
    },

    "vehicle-silhouette-03": {
        body: "M20 63 L38 52 L69 52 L85 34 L134 34 L155 52 L166 55 L166 67 L204 67 L204 87 L20 87 Z",
        windows: "M83 51 L96 39 L116 39 L116 51 Z M123 39 L132 39 L146 51 L123 51 Z",
        wheels: [55, 158],
    },

    "vehicle-silhouette-04": {
        body: "M32 37 L175 37 L192 51 L201 69 L201 88 L32 88 Z",
        windows: "M43 44 L83 44 L83 61 L43 61 Z M92 44 L132 44 L132 61 L92 61 Z M141 44 L169 44 L185 61 L141 61 Z",
        wheels: [64, 168],
    },

    "vehicle-silhouette-05": {
        body: "M25 73 L44 59 L77 54 L102 38 L150 43 L176 59 L198 64 L207 75 L207 87 L25 87 Z",
        windows: "M91 53 L107 44 L125 46 L125 53 Z M132 47 L148 49 L163 58 L132 58 Z",
        wheels: [59, 169],
    },

    "vehicle-silhouette-06": {
        body: "M32 72 L43 52 L72 49 L89 32 L139 32 L163 51 L187 56 L199 72 L199 88 L32 88 Z",
        windows: "M82 49 L96 37 L116 37 L116 49 Z M124 37 L137 37 L155 49 L124 49 Z",
        wheels: [62, 161],
    },

    "vehicle-silhouette-07": {
        body: "M18 42 L192 42 L205 55 L205 88 L18 88 Z",
        windows: "M28 49 L58 49 L58 65 L28 65 Z M66 49 L96 49 L96 65 L66 65 Z M104 49 L134 49 L134 65 L104 65 Z M142 49 L174 49 L174 65 L142 65 Z",
        wheels: [51, 166],
    },

    "vehicle-silhouette-08": {
        body: "M14 47 L132 47 L153 35 L177 35 L193 47 L211 51 L211 86 L14 86 Z",
        windows: "M141 48 L157 40 L174 40 L184 48 Z",
        wheels: [48, 177],
    },
};

export function VehicleSilhouette({
    assetId,
    className = "",
}: VehicleSilhouetteProps) {
    const vehicle =
        VEHICLE_SHAPES[assetId] ??
        VEHICLE_SHAPES["vehicle-silhouette-01"];

    return (
        <svg
            viewBox="0 0 230 115"
            role="img"
            aria-label="Vehicle silhouette"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d={vehicle.body}
                fill="#172033"
            />

            <path
                d={vehicle.windows}
                fill="#EAF5FF"
            />

            {vehicle.wheels.map((wheelX) => (
                <g key={wheelX}>
                    <circle
                        cx={wheelX}
                        cy="85"
                        r="15"
                        fill="#172033"
                    />

                    <circle
                        cx={wheelX}
                        cy="85"
                        r="6"
                        fill="#CBD5E1"
                    />
                </g>
            ))}

            <path
                d="M25 74 H207"
                stroke="#64748B"
                strokeWidth="1.5"
                opacity="0.5"
            />
        </svg>
    );
}