import argparse
import json
import sys

def calculate_requirements(age, weight, breeding_gilt, sow, lactating, boar):
    """
    Calculate energy and protein requirements for swine based on input parameters.

    Parameters:
        age (int): Age of the pig in weeks.
        weight (float): Weight of the pig in kilograms.
        breeding_gilt (bool): Whether the pig is a breeding gilt.
        sow (bool): Whether the pig is a sow.
        lactating (bool): Whether the sow is lactating.
        boar (bool): Whether the pig is a boar.

    Returns:
        dict: Energy and protein requirements.
    """
    # Default values for energy (kcal/kg DE) and protein (% CP)
    energy = None
    protein = None

    if lactating:
        energy = 3400 + (weight * 3)  # Adjusted for body weight
        protein = 16 + (weight * 0.05)  # Example adjustment for lactation
    elif sow:
        energy = 2800 + (weight * 2.5) if age < 80 else 3200
        protein = 12 + (weight * 0.04)  # Higher protein for younger sows
    elif breeding_gilt:
        energy = 3200 + (weight * 2)
        protein = 15
    elif boar:
        energy = 2800 if age < 100 else 3000
        protein = 13 + (0.02 * weight)  # Slight adjustment for larger boars
    else:
        # Growing pigs (default)
        if weight <= 25:
            energy = 3500
            protein = 23
        elif weight <= 70:
            energy = 3300
            protein = 18
        else:
            energy = 3000
            protein = 15

    return [2.2 * round(energy, 2) / 1000, round(protein, 2)] #converted energy to mcal/lb

def main():
    # Argument parsing
    parser = argparse.ArgumentParser(description="Calculate swine energy and protein requirements.")
    parser.add_argument("age", type=int, help="Age of the pig in weeks.")
    parser.add_argument("weight", type=float, help="Weight of the pig in kilograms.")
    
    # Boolean flags (optional)
    parser.add_argument("breeding_gilt", type=bool, nargs="?", default=False, help="Set if the pig is a breeding gilt.")
    parser.add_argument("sow", type=bool, nargs="?", default=False, help="Set if the pig is a sow.")
    parser.add_argument("lactating", type=bool, nargs="?", default=False, help="Set if the pig is a lactating sow.")
    parser.add_argument("boar", type=bool, nargs="?", default=False, help="Set if the pig is a boar.")

    args = parser.parse_args()

    # Calculate requirements
    requirements = calculate_requirements(
        age=args.age,
        weight=args.weight,
        breeding_gilt=args.breeding_gilt,
        sow=args.sow,
        lactating=args.lactating,
        boar=args.boar,
    )

    sys.stdout.write(json.dumps(requirements))
    #print(json.dumps(requirements))
    sys.exit(0)
    # Print results
    #print("Energy and Protein Requirements:")
    #print(f"Energy: {requirements['energy_kcal_per_kg']} kcal/kg DE")
    #print(f"Protein: {requirements['protein_percentage']}% CP")


if __name__ == "__main__":
    main()
