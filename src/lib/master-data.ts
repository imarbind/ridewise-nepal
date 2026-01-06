
export const bikeServices = [
    // Regular / Periodic
    'General Service', 'Oil Change', 'Oil Filter Change', 'Air Filter Cleaning', 
    'Air Filter Replacement', 'Chain Cleaning', 'Chain Lubrication', 'Chain Adjustment', 
    'Brake Inspection', 'Brake Cleaning', 'Throttle Cable Adjustment', 'Clutch Cable Adjustment',
    'Coolant Check', 'Coolant Replacement', 'Battery Check', 'Spark Plug Check', 
    'Wheel Alignment', 'Tyre Pressure Check',

    // Engine & Performance
    'Engine Tuning', 'Valve Clearance Adjustment', 'Carburetor Cleaning', 'Fuel Injector Cleaning',
    'Throttle Body Cleaning', 'Engine Overhaul', 'Piston Ring Replacement', 'Gasket Replacement',

    // Electrical
    'Battery Replacement', 'Wiring Check', 'Fuse Replacement', 'Starter Motor Repair',
    'Charging System Check', 'Headlight / Taillight Repair', 'Indicator Repair', 'Horn Repair',

    // Brake System
    'Brake Pad Replacement', 'Brake Shoe Replacement', 'Brake Disc Inspection', 'Brake Disc Replacement',
    'Brake Fluid Replacement', 'Brake Caliper Service', 'ABS System Check',

    // Transmission & Drivetrain
    'Clutch Plate Replacement', 'Gearbox Inspection', 'Gear Oil Change', 'Sprocket Replacement',
    'Chain & Sprocket Replacement',

    // Suspension & Steering
    'Front Fork Oil Change', 'Front Fork Seal Replacement', 'Rear Shock Inspection',
    'Rear Shock Replacement', 'Steering Bearing Replacement',

    // Cooling System
    'Radiator Cleaning', 'Radiator Hose Replacement', 'Coolant Leak Repair',

    // Body & Cosmetic
    'Fairing Repair', 'Paint Touch-up', 'Full Body Paint', 'Seat Repair', 'Decal / Sticker Replacement',

    // Emergency
    'Breakdown Repair', 'Towing Service', 'Accident Repair',
] as const;

export const bikeParts = [
    // Engine
    'Engine Oil', 'Oil Filter', 'Air Filter', 'Spark Plug', 'Piston', 'Piston Ring', 
    'Cylinder Block', 'Cylinder Head', 'Gasket Set', 'Valve Set',

    // Fuel System
    'Fuel Filter', 'Fuel Pump', 'Fuel Injector', 'Carburetor', 'Throttle Body',

    // Electrical
    'Battery', 'Headlight Bulb', 'Taillight Bulb', 'Indicator Bulb', 'Fuse', 'Ignition Coil',
    'CDI / ECU', 'Starter Motor', 'Rectifier / Regulator',

    // Brake
    'Front Brake Pad', 'Rear Brake Pad', 'Brake Shoe', 'Brake Disc', 'Brake Caliper', 
    'Brake Hose', 'Brake Fluid',

    // Drivetrain
    'Chain', 'Front Sprocket', 'Rear Sprocket', 'Chain & Sprocket Kit', 'Clutch Plate', 
    'Clutch Cable', 'Gear Cable',

    // Suspension & Steering
    'Front Fork Oil', 'Front Fork Seal', 'Rear Shock Absorber', 'Steering Bearing',

    // Wheel & Tyre
    'Front Tyre', 'Rear Tyre', 'Tube', 'Rim', 'Wheel Bearing', 'Valve',

    // Control & Cables
    'Throttle Cable', 'Brake Cable', 'Speedometer Cable',

    // Body & Accessories
    'Mirror', 'Indicator', 'Headlight Assembly', 'Tail Light Assembly', 'Number Plate Frame',
    'Seat Cover', 'Crash Guard', 'Luggage Carrier',

    // Fluids
    'Gear Oil', 'Coolant', 'Grease',
] as const;
