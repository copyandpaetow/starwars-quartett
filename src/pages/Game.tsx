import { useLoaderData } from "react-router-dom";
import { AllResults, Question } from "../data/schema";
import { useEffect, useReducer, useState } from "react";
import { getFromCacheOrFetch } from "../data/cache";
import "./Game.css";
import { saveParseFloat, shuffleArray } from "../data/utils";

type Option = {
	question: string;
	answer: string;
	predicate: "more" | "less";
};

type Card = {
	name: string;
	options: Option[];
};

type Cards = {
	ours: Card[];
	theirs: Card[];
};

const createCardsFromData = (data: AllResults, questions: Question[]) => {
	const cards: Cards = { ours: [], theirs: [] };

	//@ts-expect-error mixed typed array input is not mixed type in output for ts
	shuffleArray(data.results).forEach((entry, index) => {
		const options = questions.map((question) => ({
			question: question.type.split("_").join(" "),
			//@ts-expect-error schema is not typed properly
			answer: entry[question.type],
			predicate: question.predicate,
		}));
		cards[index % 2 === 0 ? "theirs" : "ours"].push({ name: entry.name, options }); //this is only fair for even numbers
	});

	return cards;
};

type GameProps = {
	questions: Question[];
};

export const Game = (props: GameProps) => {
	const { questions } = props;
	const initialData = useLoaderData() as AllResults;
	const [round, increaseRound] = useReducer((x) => x + 1, 0);
	const [cards, setCards] = useState(() => createCardsFromData(initialData, questions));
	const [roundWinner, setRoundWinner] = useState<{
		answer: number;
		question: string;
		outcome: "win" | "loss";
	} | null>(null);

	//in case of a deadlock the one with the most cards wins
	useEffect(() => {
		if (round <= 50) {
			return;
		}

		setCards((prevState) => {
			if (prevState.ours.length > prevState.theirs.length) {
				return { ours: [...prevState.ours, ...prevState.theirs], theirs: [] };
			}
			return { ours: [], theirs: [...prevState.theirs, ...prevState.ours] };
		});
		setRoundWinner(null);
	}, [round]);

	useEffect(() => {
		const fetchRemaining = async (data: AllResults) => {
			if (!data.next) {
				return;
			}
			const additionalData = await getFromCacheOrFetch(data.next);
			const { theirs, ours } = createCardsFromData(additionalData, questions);

			setCards((prevState) => ({
				ours: [...prevState.ours, ...ours],
				theirs: [...prevState.theirs, ...theirs],
			}));

			fetchRemaining(additionalData);
		};
		fetchRemaining(initialData);
	}, [initialData, questions]);

	const handleInput = (ourOption: Option, answer: string) => {
		const theirAnswer = saveParseFloat(
			cards.theirs[0].options.find((theirOption) => theirOption.question === ourOption.question)!
				.answer
		);
		const ourAnswer = saveParseFloat(answer);

		const didWeWin =
			(ourOption.predicate === "more" && ourAnswer >= theirAnswer) ||
			(ourOption.predicate === "less" && ourAnswer <= theirAnswer);

		setRoundWinner({
			question: ourOption.question,
			answer: theirAnswer,
			outcome: didWeWin ? "win" : "loss", //handle draw
		});
	};

	const nextRound = () => {
		const winner = roundWinner!.outcome === "win" ? cards.ours : cards.theirs;

		const ourCard = cards.theirs.shift()!;
		const theirCard = cards.ours.shift()!;

		winner.push(ourCard, theirCard);

		setCards((prevState) => ({
			ours: [...prevState.ours],
			theirs: [...prevState.theirs],
		}));
		setRoundWinner(null);
		increaseRound();
	};

	if (cards.theirs.length === 0) {
		return (
			<main>
				<h2 className="zoom">you just won the game</h2>
			</main>
		);
	}

	if (cards.ours.length === 0) {
		<main>
			<h2 className="shake">you lost it all</h2>
		</main>;
	}

	return (
		<main>
			{roundWinner ? (
				<div>
					<h2>They have: {cards.theirs[0].name}</h2>
					<h2>{`${roundWinner.question}: ${roundWinner.answer}`}</h2>
				</div>
			) : null}
			{roundWinner ? (
				<>
					<hr />
					{roundWinner.outcome === "win" ? (
						<h2 className="zoom border" onAnimationEnd={nextRound}>
							you win
						</h2>
					) : (
						<h2 className="shake border" onAnimationEnd={nextRound}>
							you lost
						</h2>
					)}
					<hr />
				</>
			) : null}
			<div className="list">
				<h2>You have: {cards.ours[0].name}</h2>
				<fieldset className="border">
					<legend>Select the best feature to compare:</legend>
					{cards.ours[0].options.map((option) => (
						<div key={option.question}>
							<input
								type="radio"
								id={option.question}
								name={option.question}
								value={option.answer}
								onChange={() => handleInput(option, option.answer)}
								checked={option.question === roundWinner?.question}
							/>
							<label htmlFor={option.question}>{`${option.question}: ${option.answer}`}</label>
						</div>
					))}
				</fieldset>
			</div>
		</main>
	);
};
