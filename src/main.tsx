import ReactDOM from "react-dom/client";
import App from "./pages/App.tsx";
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

/*
todos:

!required
- handle uneven card amounts
- within the question define if less or more should win, 
- after a certain amount of turns we should declare a winner, otherwise there could be an endless game
- add minimal stylings
- nested prefetching

*nice to have
- maybe add the option for a short match? 
- improve the typings
- handle error management for the network
=> when no more cards can be fetched
=> when the component doesnt load
=> add the option to retry
=> abort fetch after a certaina mount of time or on unmount
- add luscious amount of stylings

*/

const gameRoutes: GameRoutes = [
	{
		type: "starships",
		questions: ["cargo_capacity", "cost_in_credits", "hyperdrive_rating", "passengers"],
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

//causes rerenderings in dev mode
ReactDOM.createRoot(document.getElementById("root")!).render(
	//<React.StrictMode>
	<RouterProvider router={router} />
	//</React.StrictMode>
);
