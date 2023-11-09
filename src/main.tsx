import ReactDOM from "react-dom/client";
import { App } from "./pages/App.tsx";
import "./index.css";

import {
	createHashRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import { Game } from "./pages/Game.tsx";
import { Error } from "./pages/Error.tsx";
import { getFromCacheOrFetch } from "./data/cache.ts";
import { GameRoutes } from "./data/schema.ts";
import React from "react";

/*
todos:

*nice to have
- nested prefetching
- handle uneven card amounts
- maybe add the option for a short match? 
- improve the typings
- handle error management for the network
=> when no more cards can be fetched
=> when the component doesnt load
=> add the option to retry
=> abort fetch after a certaina mount of time or on unmount
- add luscious amount of stylings

*/

//our question selection
//this makes it less data driven though but we cant compare all values and need to preselect
const gameRoutes: GameRoutes = [
	{
		type: "starships",
		questions: [
			{ type: "cargo_capacity", predicate: "more" },
			{ type: "cost_in_credits", predicate: "more" },
			{ type: "hyperdrive_rating", predicate: "more" },
			{ type: "passengers", predicate: "more" },
		],
		loadingText: "getting in formation",
	},
	{
		type: "vehicles",
		questions: [
			{ type: "length", predicate: "more" },
			{ type: "cost_in_credits", predicate: "more" },
			{ type: "max_atmosphering_speed", predicate: "more" },
			{ type: "passengers", predicate: "more" },
		],
		loadingText: "starting the engines",
	},
];

const router = createHashRouter(
	createRoutesFromElements(
		<Route path="/">
			<Route index element={<App gameRoutes={gameRoutes} />} />
			{gameRoutes.map((entry) => (
				<Route
					key={entry.type}
					path={entry.type}
					element={<Game questions={entry.questions} />}
					loader={() => getFromCacheOrFetch(`https://swapi.dev/api/${entry.type}/`)}
					errorElement={<Error />}
				/>
			))}
		</Route>
	)
);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
