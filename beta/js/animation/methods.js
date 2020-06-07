/**
 * Plays the playback animation that runs during the audio preview.
 * @param {number} blocksPerFrame The scroll speed of the animation, in tiles travelled per 60th of a second.
 * @param {number} maxX The maximum position to scroll to before ending the animation.
 * @param {number} delay The number of seconds before the animation starts.
 */
function animatePlayback(blocksPerFrame, maxX, delay) {
	playbackAnim = new Animation(((anim) => {
		canvasLayers[dlayer.mouseLayer].clear();
		let xPos = Math.floor(((marginWidth + drawOffsetX) + (blocksPerFrame * anim.frameCount)) * 16);
		if (xPos / 16 > maxX) {
			if (isAnimating) {
				setTimeout(() => stopAudio(), 2000);
				isAnimating = false;
				resetPlayback();
			}
			return;
		}
		canvasLayers[dlayer.mouseLayer].drawLine(xPos, 0, xPos, levelHeight * 16);
		scrollDisplayTo(xPos - ((marginWidth + drawOffsetX) * 16));
		let spriteNum = 0;
		// Adjust the animation speed based on the scroll speed
		let period = Math.round((BASE_WALK_SPEED / blocksPerFrame) * BASE_WALK_PERIOD);
		if (getFraction(anim.frameCount / period) < 0.5) spriteNum = 0;
		else spriteNum = 1;
		// Change to running animation if the speed is within 1% of running speed
		if (blocksPerFrame >= RUN_SPEED * 0.99) spriteNum += 2;
		drawSprite(marioSprites[spriteNum], xPos - 240, 396, dlayer.mouseLayer);
		refreshCanvas();
	}));
	isAnimating = true;
	setTimeout(() => playbackAnim.start(), delay * 1000);
}

/**
 * Animates playback for the entire song, not just the level.
 * @param {number} blocksPerFrame The scroll speed of the animation, in tiles travelled per 60th of a second.
 * @param {number} maxX The maximum position to scroll to before ending the animation.
 * @param {number} delay The number of seconds before the animation starts.
 */
function animateContinuousPlayback(blocksPerFrame, delay) {
	const startX = ofsX;
	const tileLimX = Math.floor(
		(minimap.width - (canvas.width / 16 - 27)) + (blocksPerBeat * bbar) / 16
	) + CONT_SCROLL_X;
	let lastMovingX = 0;
	let ranEndTransition = false;
	playbackAnim = new Animation(((anim) => {
		canvasLayers[dlayer.mouseLayer].clear();
		let xPos = Math.floor((marginWidth + (blocksPerFrame * anim.frameCount)) * 16);
		let tilePos = Math.floor(xPos / 16);
		let globalTilePos = xPos / 16 + startX;
		let drawPos = xPos;
		if (globalTilePos > tileLimX + levelWidth - CONT_SCROLL_X + 5) {
			if (isAnimating) {
				setTimeout(() => stopAudio(), 2000);
				isAnimating = false;
				resetPlayback();
			}
			return;
		}
		// console.log(xPos);
		// Case 1: Level begins scrolling
		if (tilePos < CONT_SCROLL_X) {
			drawPos = xPos;
			scrollDisplayTo(xPos - (marginWidth * 16));
			// Case 2: The level is in the middle of scrolling
		} else if (tilePos >= CONT_SCROLL_X && globalTilePos < tileLimX) {
			let ofs = xPos % 16;
			drawPos = (CONT_SCROLL_X * 16) + ofs;
			setLevelXTo(tilePos - CONT_SCROLL_X + startX);
			scrollDisplayTo((CONT_SCROLL_X - marginWidth) * 16 + ofs);
			canvasLayers[dlayer.bgLayer].setXOfs(ofs);
			// Case 3: The level is about to stop scrolling
		} else { // FIXME: Fix playback end behavior
			if (!ranEndTransition) {
				lastMovingX = tilePos - CONT_SCROLL_X + startX + 1;
				canvasLayers[dlayer.bgLayer].setXOfs(0);
				ranEndTransition = true;
			}
			setLevelXTo(lastMovingX);
			drawPos = (CONT_SCROLL_X + globalTilePos - tileLimX) * 16;
			scrollDisplayTo((CONT_SCROLL_X + globalTilePos - tileLimX - marginWidth) * 16);
		}
		canvasLayers[dlayer.mouseLayer].drawLine(drawPos, 0, drawPos, levelHeight * 16);

		let spriteNum = 0;
		// Adjust the animation speed based on the scroll speed
		let period = Math.round((BASE_WALK_SPEED / blocksPerFrame) * BASE_WALK_PERIOD);
		if (getFraction(anim.frameCount / period) < 0.5) spriteNum = 0;
		else spriteNum = 1;
		// Change to running animation if the speed is within 1% of running speed
		if (blocksPerFrame >= RUN_SPEED * 0.99) spriteNum += 2;
		drawSprite(marioSprites[spriteNum], drawPos - 240, 396, dlayer.mouseLayer);
		refreshCanvas();
	}));
	isAnimating = true;
	setTimeout(() => playbackAnim.start(), delay * 1000);
}

/**
 * End the level playback animation.
 */
function stopPlaybackAnimation() {
	if (playbackAnim === undefined) return;
	playbackAnim.stop();
	canvasLayers[dlayer.mouseLayer].clear();
	canvasLayers[dlayer.bgLayer].setXOfs(0);
	refreshCanvas();
}
