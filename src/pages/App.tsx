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
	const { gameRoutes } = props;
	const [isLoading, startLoading] = useReducer(() => true, false);

	useEffect(() => {
		const asyncFn = async () => {
			// when everything is loaded we already start with some prefetching
			for await (const entry of gameRoutes) {
				await whenBrowserHasTime();
				getFromCacheOrFetch(`https://swapi.dev/api/${entry.type}/`);
			}
		};
		asyncFn();
	}, [gameRoutes]);

	return (
		<main className="list">
			<header>
				<h1 className="border">
					STAR <br /> WARS
				</h1>
				<p>Quartett edition</p>
			</header>

			<p>select game category: </p>

			<nav className="list">
				{gameRoutes.map((route) => (
					<Link to={`/${route.type}`} onClick={startLoading} key={route.type} className="border">
						{isLoading ? route.loadingText : route.type}
						{isLoading ? <span className="loading"></span> : null}
					</Link>
				))}
			</nav>
		</main>
	);
};
