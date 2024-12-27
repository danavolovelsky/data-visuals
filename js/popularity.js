const genres = [
  "Alternative", "Blues", "Country", "Dance", "Disco",
  "Electronic", "Folk", "Indie", "Jazz", "Latin",
  "Metal", "Pop", "Rap", "Reggae", "Rock"
];


// Process data for specific year
function processData(data) {
  // Array to hold the popularity numbers for each genre
  const originalPopularity = [];

  data.forEach((row, rowIndex) => {
    row.forEach((value, index) => {

      // If the genre's popularity number for this row hasn't been added yet, add it to the array
      if (rowIndex === index) {
        originalPopularity.push(value);
      }
    });
  });

  console.log("Genre Popularity Numbers:", originalPopularity);
  return originalPopularity;
}

function calculatePopularity(originalPopularity) {
  // Find maximum value
  const maxPopularity = Math.max(...processData(originalPopularity));
  console.log("max pop", maxPopularity)
  
  // Scale values to range of 0-12
  const relativePopularity = processData(originalPopularity).map(popularity => (popularity / maxPopularity) * 12);

  const genrePopularity = {};

  genres.forEach((genre, index) => {
    // Assign the scaled popularity value for each genre
    genrePopularity[genre] = relativePopularity[index];
  });

  console.log("Normalized Popularity:", genrePopularity);

  return genrePopularity;
}

/**
  // Reference: https://stackoverflow.com/questions/28188987/how-to-save-json-data-to-file
function savePopularity(genrePopularity) {
  const blob = new Blob([JSON.stringify(genrePopularity, null, 2)], { type: "application/json" });
  saveAs(blob, "popularity.json");
}
 */

// Reference: https://www.youtube.com/watch?v=aSfc6Nohpqs
// Load JSON files
Promise.all([
  d3.json("data/matrix1950s.json"),
  d3.json("data/matrix1960s.json"),
  d3.json("data/matrix1970s.json"),
  d3.json("data/matrix1980s.json"),
  d3.json("data/matrix1990s.json"),
  d3.json("data/matrix2000s.json")
]).then(function(files) {
  const dataset = files;
  const width = 1425; 
  const height = 340;

  // Implement slider logic

  const slider = document.getElementById('slider');
  const selectedYear = document.getElementById('selectedYear');
  const labels = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];


  // Descriptions
  const yearStories = {
    '1950s': "In the 1950s, several major genres dominated the music landscape. Pop, Rock, Blues, Jazz were the leading genres of the decade, Country and Dance closely followed in popularity. Rock music, in particular, was immensely successful, evolving into various sub-genres under the umbrella of Rock n' Roll. This signified a cultural evolution, marking a slightly rebellious era for many young people. The emergence of Elvis Presley played a crucial role in popularising Rock 'n' roll. Originating from both European and African-American musical traditions, this genre reinforced ideas of moderate racial equality. The common culture of Rock 'n' Roll helped to erode long-standing prejudices against African Americans, fostering a sense of shared cultural identity.",
    '1960s': "The 1960s saw Rock, Pop, Blues and Jazz still on top, with Folk gaining new dedicated followings. Rock n’ roll continued to evolve, splitting into ‘hard’ rock and lighter ‘soft’ rock. Rock n’ roll was dominated by the Beatles, whose success sparked the ‘British Invasion’, with bands like The Rolling Stones, The Animals, and The Who also achieving hits worldwide. Additionally, Folk music saw a revival with young performers like Bob Dylan and Joan Baez, who infused traditional folk styles with political commentary on contemporary issues such as the civil rights movement and the Vietnam War. ",
    '1970s': "The 1970s created a musical bridge between the rebelliousness of the 1960s and the upbeat songs of the 1980s. This shift gave birth to the Disco movement, as people sought refuge in dance clubs from the previous decade's turmoil. Simultaneously, Heavy Metal and Punk Rock emerged, which introduced a more aggressive and distorted sound, continuing the rebellious spirit of the 60s with a harder edge. Bands like The Ramones and The Sex Pistols voiced societal discontent, while others introduced a more radio-friendly, electronic-influenced sound. The most influential rock artist of the 1970s was Pink Floyd, who became one of the biggest bands in history. They are known as the band that popularised progressive rock, a genre characterised by long, atmospheric rock tracks, using keyboard synths alongside guitars and drums to portray an emotional or psychedelic ‘vibe’. Additionally, Reggae, which originated in Jamaica gained international prominence, voicing the struggles and resilience of the oppressed, led by artists like Bob Marley.",
    '1980s': "The 1980s witnessed significant shifts in musical trends. Folk music began to decline, losing the prominence it had in previous decades. Blues and jazz also saw a reduction in mainstream popularity, overshadowed by the rapid evolution of other genres. Reggae, which had enjoyed global fame largely due to Bob Marley, faced a decline after his death in 1981, losing its central figure and mainstream momentum. Electronic Dance Music (EDM) emerged as a dominant force, diversifying into sub-genres like house and techno. This era marked a significant shift towards synthesized sounds and digital production, making EDM synonymous with 80s nightlife and dance culture. Rock and pop also integrated electronic elements, broadening EDM's appeal and solidifying its influence on the decade's music scene.",
    '1990s': "The 1990s saw the rise of new musical trends and the decline of others. Rap music surged to the forefront, becoming one of the most influential genres of the decade. Artists like Tupac Shakur, Notorious B.I.G., and Dr. Dre brought rap into the mainstream. After its short-lived success Disco continued its decline from the previous decade, making way for the surge of dance and electronic music. These genres gained huge popularity, fueled by advancements in technology and the growing club scene. The internet revolutionized music distribution, allowing indie bands to reach audiences directly without  relying on traditional record labels. This led to a rapid rise in Indie (rock), as bands like Nirvana and Radiohead could now share their music for free or at low cost, making it more accessible to the public.",
    '2000s': "The 2000s witnessed the continued rise of indie bands, fueled by the increasing popularity of music sharing platforms and online communities. With the advent of file-sharing services like Napster and later, social media platforms like MySpace, independent artists found new ways to reach audiences directly and gaining widespread exposure. Meanwhile, rap, metal, electronic, and dance music continued to gain momentum, just like Hiphop and R&B, solidifying their places as dominant genres in the mainstream. The 2000s saw the emergence of artists like Eminem, Outkast and Beyoncé. However, the decline of blues persisted, as the genre struggled to find a foothold in the rapidly changing music industry. While blues remained influential in niche circles and among dedicated fans, its mainstream popularity continued to wane."
  };
  
  const yearStory = document.getElementById('yearStory');
  
  // Handle input, update visualisation when value changes
  slider.addEventListener('input', () => {
    // Get index from slider value and update selected year (main) text
    const index = slider.value;
    const year = labels[index];
    selectedYear.textContent = year;
    yearStory.textContent = yearStories[year];
  
    const data = dataset[index];
    
  
    // Calculate relative popularity of each genre
    const genrePopularity = calculatePopularity(data);

    //savePopularity(genrePopularity); 
  
    const innerRadius = 100; 

    // When the slider moves, old data gets removed and does not stay
    d3.select("svg").selectAll("*").remove();
    
    // Reference Circle logic: https://gist.github.com/bycoffe/3404776

    // Create images based on popularity, i is variable of current genre
    genres.forEach((genre, i) => {
      // Check if genrePopularity is a number and not negative
      if (genrePopularity[genre] >= 0) {
        // Calculate angle for circular positioning; Distributing images evenly in a circle
        const angle = (Math.PI * 2 / genres.length) * i;
        
        // Calculates distance to images
        const outerRadius = innerRadius + (genrePopularity[genre] * 10); // Scale factor for radius
    
        // Calculate x and y positions for each image and center in svg element
        const x = outerRadius * Math.cos(angle) + (width / 2);
        const y = outerRadius * Math.sin(angle) + (height / 2);
    
        // Create array with length of popularity value -> new img element for each item in genreData
        const genreData = Array(Math.round(genrePopularity[genre])).fill(genre);
        genreData.forEach((_, index) => {
          // Calculate the position for each image along the angle
          const imageRadius = innerRadius + (index * 16); // Adjust spacing between images
          const imageX = imageRadius * Math.cos(angle) + (width / 2);
          const imageY = imageRadius * Math.sin(angle) + (height / 2) + 100;
    
          // Append image to SVG
          d3.select("svg")
            .append("image")
            .attr("xlink:href", "imgs/" + genre + ".png")
            .attr("x", imageX)
            .attr("y", imageY)
            .attr("width", 30) 
            .attr("height", 30)
            .attr("transform", `translate(-15, -15)`); 
        });
      }
    });
  }); 

  // Trigger input event to initialize visualization
  slider.dispatchEvent(new Event('input'));
})


