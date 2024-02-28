// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script')
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js'
document.head.appendChild(markdownIt)



// Okay, Are.na stuff!
let channelSlug = 'feeling-kinda-blue' // The “slug” is just the end of the URL



// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (data) => {
	// Target some elements in your HTML:
	let channelTitle = document.getElementById('channel-title')
	let channelDescription = document.getElementById('channel-description')
	// let channelCount = document.getElementById('channel-count') 
	let channelLink = document.getElementById('channel-link')
	let channelOwner = document.getElementById('channel-owner')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = data.title
	channelDescription.innerHTML = window.markdownit().render(data.metadata.description) // Converts Markdown → HTML
	// channelCount.innerHTML = data.length
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
	channelOwner.innerHTML = data.owner.full_name
}



// Then our big function for specific-block-type rendering:
let renderBlock = (block) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let channelBlocks = document.getElementById('channel-blocks')


// Links!
if (block.class == 'Link') {
	let linkItem = `
			<li class="link-container" onclick="toggleBlockDetails(this)">
		<picture>
				<source media="(max-width: 480px)" srcset="${block.image.thumb.url}">
				<source media="(max-width: 720px)" srcset="${block.image.large.url}">
				<img src="${block.image.original.url}">
		</picture>
		// <div class="block-details">
		// 		<h3>${block.title}</h3>
		// 		${block.description_html}
		// 		<p><a href="${block.source.url}">See the original ↗</a></p>
		// </div>
</li>
	`;
	channelBlocks.insertAdjacentHTML('beforeend', linkItem);
}

	// Images!
	if (block.class == 'Image') {

		let imageItem =
			`
				<li class="block block--image">
					<figure>
						<img src=${block.image.large.url} alt= ${block.title} by ${block.user.full_name}>
					</figure>
				</li>
			`
		channelBlocks.insertAdjacentHTML('beforeend', imageItem)
	}

	// Text!
	else if (block.class == 'Text') {
		console.log(block)
		let textItem =
		`
			<li class="block block--text">
				<div class="text-content">
					<a href="${block.attachment.url}">
						<h4>${ block.title }</h4>
						<p>${ block.content_html }</p>
					</a>
				</div>
			</li>
		`
		channelBlocks.insertAdjacentHTML('beforeend', textItem)
	}

	// Uploaded (not linked) media…
	else if (block.class == 'Attachment') {
		let attachment = block.attachment.content_type

	// Uploaded videos!
	if (attachment.includes('Video')) {
		let videoItem =
			`
			<li class=link container>
				<video controls src="${ block.attachment.url }"></video>
			</li>
			`
		channelBlocks.insertAdjacentHTML('beforeend', videoItem)
	}

	// Uploaded PDFs!
	else if (attachment.includes('pdf')) {
		let pdfItem =
			`
				<li class="pdf-container">
					<div class="pdf-content">
						<a href="${block.attachment.url}">
							<figure>
								<img controls src="${block.image.large.url}" alt="${block.title}">
							</figure>
						</a>
					</div?>
				</li>
			`
		channelBlocks.insertAdjacentHTML('beforeend', pdfItem);
	}

		// Uploaded audio!
		else if (attachment.includes('audio')) {
			// …still up to you, but here’s an `audio` element:
			let audioItem =
				`
				<li>
					<p><em>Audio</em></p>
					<audio controls src="${ block.attachment.url }"></video>
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', audioItem)
			// More on audio: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
		}
	}

	// Linked media…
	if (block.class == 'Media') {
		let embed = block.embed.type

		// Linked video!
		if (embed.includes('video')) {
			// …still up to you, but here’s an example `iframe` element:
			let linkedVideoItem =
				`
				<li>
					${ block.embed.html }
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem)
		}

		// Linked audio!
		else if (embed.includes('rich')) {
			// …up to you!
		}
	}
}

// Get the grid container
const container = document.querySelector('.blocks');

// Randomize gap, padding, and margin values
const gap = Math.floor(Math.random() * 10 + 10); // Random gap between 10 and 20
const padding = Math.floor(Math.random() * 10 + 5); // Random padding between 5 and 15
const margin = Math.floor(Math.random() * 10 + 5); // Random margin between 5 and 15

// Set CSS custom properties
container.style.setProperty('--gap', `${gap}px`);
container.style.setProperty('--padding', padding);
container.style.setProperty('--margin', margin);

// Now that we have said what we can do, go get the data:
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
	.then((response) => response.json()) // Return it as JSON data
	.then((data) => { // Do stuff with the data
		console.log(data) // Always good to check your response!
		placeChannelInfo(data) // Pass the data to the first function

		// Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
		data.contents.reverse().forEach((block) => {
			// console.log(block) // The data for a single block
			renderBlock(block) // Pass the single block data to the render function
		})

		// Also display the owner and collaborators:
		let channelUsers = document.getElementById('channel-users') // Show them together
		data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers))
		renderUser(data.user, channelUsers)
	})
