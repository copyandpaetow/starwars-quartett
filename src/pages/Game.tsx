import { useLoaderData } from "react-router-dom";
import { AllResults } from "../data/schema";
import { useEffect, useState } from "react";
import { getFromCacheOrFetch } from "../data/cache";
import "./Game.css";
import { saveParseFloat, shuffleArray } from "../data/utils";

type Card = {
	name: string;
	options: { question: string; answer: string }[];
};

type Cards = {
	ours: Card[];
	theirs: Card[];
};

const createCardsFromData = (data: AllResults, questions: string[]) => {
	const cards: Cards = { ours: [], theirs: [] };

	//@ts-expect-error mixed typed array input is not mixed type in output for ts
	shuffleArray(data.results).forEach((entry, index) => {
		const options = questions.map((question) => ({
			question: question.split("_").join(" "),
			//@ts-expect-error schema is not typed properly
			answer: entry[question],
		}));
		cards[index % 2 === 0 ? "theirs" : "ours"].push({ name: entry.name, options }); //this is only fair for even numbers
	});

	return cards;
};

type GameProps = {
	questions: string[];
};

export const Game = (props: GameProps) => {
	const { questions } = props;
	const initialData = useLoaderData() as AllResults;
	const [cards, setCards] = useState(() => createCardsFromData(initialData, questions));
	const [roundWinner, setRoundWinner] = useState<{
		answer: number;
		question: string;
		outcome: "win" | "loss";
	} | null>(null);

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

	const handleInput = (ourQuestion: string, answer: string) => {
		const theirAnswer = saveParseFloat(
			cards.theirs[0].options.find((option) => option.question === ourQuestion)!.answer
		);
		const ourAnswer = saveParseFloat(answer);

		setRoundWinner({
			question: ourQuestion,
			answer: theirAnswer,
			outcome: ourAnswer >= theirAnswer ? "win" : "loss", //handle draw
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
	};

	if (cards.theirs.length === 0) {
		return <div>you just won the game</div>;
	}

	if (cards.ours.length === 0) {
		<div>you lost it all</div>;
	}

	return (
		<section>
			{roundWinner ? (
				<div>
					<h2>{cards.theirs[0].name}</h2>
					<h2>{`${roundWinner.question}: ${roundWinner.answer}`}</h2>
				</div>
			) : null}
			{roundWinner ? (
				<>
					<hr />

					{roundWinner.outcome === "win" ? (
						<h2 className="zoom" onAnimationEnd={nextRound}>
							you win
						</h2>
					) : (
						<h2 className="shake" onAnimationEnd={nextRound}>
							you lost
						</h2>
					)}

					<hr />
				</>
			) : null}
			<div>
				<h2>{cards.ours[0].name}</h2>
				<fieldset>
					<legend>Select a feature that is like better than your opponents one:</legend>
					{cards.ours[0].options.map((option) => (
						<div key={option.question}>
							<input
								type="radio"
								id={option.question}
								name={option.question}
								value={option.answer}
								onChange={() => handleInput(option.question, option.answer)}
								checked={option.question === roundWinner?.question}
							/>
							<label htmlFor={option.question}>{`${option.question}: ${option.answer}`}</label>
						</div>
					))}
				</fieldset>
			</div>
		</section>
	);
};
