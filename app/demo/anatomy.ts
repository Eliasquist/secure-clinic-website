
export const ANATOMY_ZONES = [
    // --- Upper Face ---
    {
        id: 'frontalis',
        name: 'Forehead (Frontalis)',
        path: 'M20,20 Q50,15 80,20 Q85,40 80,50 Q50,55 20,50 Q15,40 20,20',
        type: 'MUSCLE',
        description: 'Horizontal forehead lines'
    },
    {
        id: 'glabella',
        name: 'Glabella (Frown Lines)',
        path: 'M40,52 Q50,55 60,52 L58,65 Q50,68 42,65 Z',
        type: 'MUSCLE',
        description: '11 lines between brows'
    },
    {
        id: 'crows_feet_l',
        name: 'Crow\'s Feet (L)',
        path: 'M10,60 Q5,65 10,75 L20,70 Z',
        type: 'MUSCLE',
        description: 'Lateral orbicularis oculi'
    },
    {
        id: 'crows_feet_r',
        name: 'Crow\'s Feet (R)',
        path: 'M90,60 Q95,65 90,75 L80,70 Z',
        type: 'MUSCLE',
        description: 'Lateral orbicularis oculi'
    },

    // --- Mid Face ---
    {
        id: 'cheek_l',
        name: 'Cheek (L)',
        path: 'M15,80 Q30,75 40,85 Q35,100 20,95 Z',
        type: 'VOLUME',
        description: 'Zygomatic arch / Malar fat'
    },
    {
        id: 'cheek_r',
        name: 'Cheek (R)',
        path: 'M85,80 Q70,75 60,85 Q65,100 80,95 Z',
        type: 'VOLUME',
        description: 'Zygomatic arch / Malar fat'
    },
    {
        id: 'nasolabial_l',
        name: 'Nasolabial Fold (L)',
        path: 'M42,90 Q38,105 35,115 L32,112',
        type: 'VOLUME',
        description: 'Smile lines'
    },
    {
        id: 'nasolabial_r',
        name: 'Nasolabial Fold (R)',
        path: 'M58,90 Q62,105 65,115 L68,112',
        type: 'VOLUME',
        description: 'Smile lines'
    },

    // --- Lower Face ---
    {
        id: 'lips',
        name: 'Lips',
        path: 'M35,115 Q50,112 65,115 Q60,125 50,128 Q40,125 35,115 Z',
        type: 'VOLUME',
        description: 'Lip volume and border'
    },
    {
        id: 'mentalis',
        name: 'Chin (Mentalis)',
        path: 'M40,135 Q50,130 60,135 Q58,145 50,148 Q42,145 40,135 Z',
        type: 'MUSCLE',
        description: 'Chin dimpling'
    },
    {
        id: 'masseter_l',
        name: 'Masseter (L)',
        path: 'M15,110 Q25,110 25,130 Q15,128 10,115 Z',
        type: 'MUSCLE',
        description: 'Jaw slimming'
    },
    {
        id: 'masseter_r',
        name: 'Masseter (R)',
        path: 'M85,110 Q75,110 75,130 Q85,128 90,115 Z',
        type: 'MUSCLE',
        description: 'Jaw slimming'
    }
];
