export type Spaceships = {
	MGLT: string;
	cargo_capacity: string;
	consumables: string;
	cost_in_credits: string;
	created: string;
	crew: string;
	edited: string;
	hyperdrive_rating: string;
	length: string;
	manufacturer: string;
	max_atmosphering_speed: string;
	model: string;
	name: string;
	passengers: string;
	films: string[];
	pilots: [];
	starship_class: string;
	url: string;
};

export type Vehicles = {
	cargo_capacity: string;
	consumables: string;
	cost_in_credits: string;
	created: string;
	crew: string;
	edited: string;
	length: string;
	manufacturer: string;
	max_atmosphering_speed: string;
	model: string;
	name: string;
	passengers: string;
	pilots: string[];
	films: string[];
	url: string;
	vehicle_class: string;
};

type Results<Type> = {
	count: number;
	next: string | null;
	previous: string | null;
	results: Type[];
};

export type AllResults = Results<Vehicles> | Results<Spaceships>;

export type Question = {
	type: keyof Vehicles | keyof Spaceships;
	predicate: "more" | "less";
};

export type GameRoutes = { type: string; questions: Question[]; loadingText: string }[];
