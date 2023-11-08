import { useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import { getFromCacheOrFetch } from "../data/cache";
import { GameRoutes } from "../data/schema";
import { whenBrowserHasTime } from "../data/utils";
import "./App.css";

type AppProps = {
	gameRoutes: GameRoutes;
};

export const App = (props: AppProps) => {
	const [isLoading, startLoading] = useReducer(() => true, false);

	useEffect(() => {
		const asyncFn = async () => {
			// when everything is loaded we already start with some prefetching
			for await (const entry of props.gameRoutes) {
				await whenBrowserHasTime();
				getFromCacheOrFetch(`https://swapi.dev/api/${entry.type}/`);
			}
		};
		asyncFn();
	}, [props.gameRoutes]);

	return (
		<>
			<Link to="/starships" onClick={startLoading}>
				{isLoading ? "loading" : "starships"}
			</Link>
		</>
	);
};

export default App;
