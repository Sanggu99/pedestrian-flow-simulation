import { Vector3, BoxGeometry } from 'three';

export interface WallDef {
    position: [number, number, number];
    size: [number, number, number];
}

export interface Layout {
    id: string;
    name: string;
    description: string;
    walls: WallDef[];
    exits: Vector3[];
    spawnPoints: { min: Vector3; max: Vector3 }[];
}

export const LAYOUTS: Layout[] = [
    {
        id: 'EMPTY',
        name: 'Empty Space (Open)',
        description: 'Open 100x100m plaza with exits at corners.',
        walls: [],
        exits: [
            new Vector3(-45, 0, -45),
            new Vector3(45, 0, -45),
            new Vector3(-45, 0, 45),
            new Vector3(45, 0, 45)
        ],
        spawnPoints: [
            { min: new Vector3(-40, 0, -40), max: new Vector3(40, 0, 40) }
        ]
    },
    {
        id: 'GALLERY',
        name: 'Art Gallery',
        description: 'Partition walls creating a flow.',
        walls: [
            // Central Divider
            { position: [0, 2.5, 0], size: [2, 5, 60] },
            // Floating Panels
            { position: [-20, 2.5, 10], size: [15, 5, 2] },
            { position: [20, 2.5, -10], size: [15, 5, 2] },
            { position: [-20, 2.5, -30], size: [15, 5, 2] },
            { position: [20, 2.5, 30], size: [15, 5, 2] }
        ],
        exits: [
            new Vector3(0, 0, -48), // North Main
            new Vector3(0, 0, 48)   // South Main
        ],
        spawnPoints: [
            { min: new Vector3(-40, 0, -40), max: new Vector3(40, 0, 40) }
        ]
    },
    {
        id: 'OFFICE',
        name: 'Office Floor',
        description: 'Central corridor with rooms.',
        walls: [
            // Corridor Walls (Long Z-axis)
            { position: [-10, 2.5, 0], size: [2, 5, 90] },
            { position: [10, 2.5, 0], size: [2, 5, 90] },

            // Room Dividers (Left)
            { position: [-25, 2.5, -15], size: [30, 5, 2] },
            { position: [-25, 2.5, 15], size: [30, 5, 2] },

            // Room Dividers (Right)
            { position: [25, 2.5, -15], size: [30, 5, 2] },
            { position: [25, 2.5, 15], size: [30, 5, 2] }
        ],
        exits: [
            new Vector3(0, 0, -48), // Corridor North
            new Vector3(0, 0, 48),  // Corridor South
            new Vector3(-48, 0, 0), // Side Emergency
            new Vector3(48, 0, 0)   // Side Emergency
        ],
        spawnPoints: [
            { min: new Vector3(-5, 0, -40), max: new Vector3(5, 0, 40) } // Start in corridor
        ]
    },
    {
        id: 'AUDITORIUM',
        name: 'Auditorium',
        description: 'Large hall with specific exits.',
        walls: [
            // Stage Back
            { position: [0, 2.5, -40], size: [60, 5, 2] },
            // Side Walls (Partial)
            { position: [-30, 2.5, 0], size: [2, 5, 80] },
            { position: [30, 2.5, 0], size: [2, 5, 80] },
        ],
        exits: [
            new Vector3(-20, 0, 48), // Rear Left
            new Vector3(20, 0, 48),  // Rear Right
            new Vector3(-35, 0, 0), // Side Exit Left
            new Vector3(35, 0, 0)   // Side Exit Right
        ],
        spawnPoints: [
            { min: new Vector3(-25, 0, -30), max: new Vector3(25, 0, 30) }
        ]
    }
];
