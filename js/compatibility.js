const genres = [
  "Alternative", "Blues", "Country", "Dance", "Disco",
  "Electronic", "Folk", "Indie", "Jazz", "Latin",
  "Metal", "Pop", "Rap", "Reggae", "Rock"
];

Promise.all([
  d3.json("data/matrix1950s.json"),
  d3.json("data/matrix1960s.json"),
  d3.json("data/matrix1970s.json"),
  d3.json("data/matrix1980s.json"),
  d3.json("data/matrix1990s.json"),
  d3.json("data/matrix2000s.json")
]).then(function(files) {

  //Reference Logic to process data and calculate percentages was assisted by OpenAI ChatGPT 4 (June 2024)
  // Iterates over Matrix, Matrix represents decades worth of data
  const datasets = files.map(matrix => {
    // Processes each row (specific genres relationship with the rest of the genres)
    return matrix.map((row, rowIndex) => {
      // Sum of row -> divisor in percentage calculation
      const total = row.reduce((sum, value) => sum + value, 0);
      // Map values in the row to new structure
      return row.map((value, colIndex) => {
        if (colIndex === rowIndex) {
          return null; // Ignore the genre's own value for percentage calculation
        }
        return {
          genre: genres[colIndex], // Identify genre based on column index
          percentage: ((value / total) * 100).toFixed(2) // Calculate percentages and get 2 decimal places
        };
      }).filter(Boolean); // Remove null values
    });
  });

  // Get top 5 compatible genres based on calculated percentage 
  const top5Datasets = datasets.map(decadeData => {
    return decadeData.map(genreData => {
      const sortedGenreData = genreData.sort((a, b) => b.percentage - a.percentage);
      return sortedGenreData.slice(0, 5); // Keep only top 5 
    });
  });

  // Dropdown menu with genres
  function populateDropdown(dropdownId, optionsArray) {
    const selectElement = document.getElementById(dropdownId);
    optionsArray.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre;
      option.textContent = genre;
      selectElement.appendChild(option);
    });
  }

  const genreDescriptions = {
    "Alternative": "Alternative rock emerged as a transformative force in the music scene, characterized by its distorted guitars and fueled by a sense of generational discontent. Represented by bands like Nirvana, this genre broke into the mainstream with hits like 'Smells Like Teen Spirit',  challenging the current state of pop radio. Ironically, many alternative rockers were shaped by the music of the late 1950s and ’60s, growing up amidst the rise of classic rock. However, they were yearning for something different, rejecting mainstream conventions in favour of a more rebellious sound. This movement embodied a desire for change and a departure from the norms of the past.",
    "Blues": "Blues-rock emerged as a distinct subgenre in the late '60s, combining traditional blues elements with the instrumental improvisation of rock. Bands like Cream and the Paul Butterfield Blues Band pioneered this fusion, drawing influence from both British and American blues traditions. As the genre evolved, it gave rise to heavy metal and Southern rock, characterized by loud amplification and extended solos. Although blues-rock briefly intersected with hard rock in the early '70s, it eventually found its own identity, with some artists staying true to blues standards while others explored new songwriting avenues.",
    "Country": "Country rock emerged in the United States, particularly in Southern and Western regions. It was born from rock musicians who began to blend rock music with country themes, vocal styles, and instruments like the pedal steel guitar. Artists such as Buffalo Springfield, Bob Dylan, and the Byrds were pioneers of this genre, which reached its peak popularity in the 1970s with bands like the Eagles and artists like Emmylou Harris. Unlike country pop, which leans more towards a polished pop sound with smooth melodies, country rock incorporates a grittier rock influence, often featuring louder electric guitars and a more energetic vibe. ",
    "Dance": "Dance Pop is an electronic dance music genre known for its nightclub-friendly beats and accessibility for mainstream radio. It blends elements from various genres like R&B, Trance, Techno, and House, emphasizing composition over vocals. Emerging in the 1970s-1980s as disco declined, Dance Pop evolved with a more experimental, synth-based sound. Key figures in Dance Pop's rise include DJs like Larry Levan and Frankie Knuckles, who transitioned from Disco to producing hits in the genre. Artists like George Michael, Madonna, and Cyndi Lauper helped popularize Dance Pop in the 1980s with songs like ‘Wake Me Up Before You Go-Go’ and ‘Holiday’. Early Dance Pop songs were simpler but more structured than traditional dance music.",
    "Disco": "Emerging in the 1970s, disco is characterized by its four-on-the-floor beat, syncopated basslines, and lush orchestration. It surged in popularity during the late 1970s and early 1980s, with its own unique sound and cultural identity. It shares a lot of similarities with pop music, such as catchy melodies and mainstream appeal, standing out with a distinct focus on rhythm and groove. During the peak of the disco era, many pop artists infused their music with disco elements, blurring the lines between the two genres. Disco tracks often emphasize extended dance-friendly beats and prominent basslines, therefore often cross tagged with Dance too.",
    "Electronic": "Electronic music has undergone many changes over the decades. Electronic rock music, also known as Electro-Rock, blends traditional rock instruments like guitar, bass, and drums with electronic elements such as synthesisers, samplers, and drum machines. Its origins trace back to the late 1960s, when rock bands began integrating electronic instrumentation into their music. In the late '70s, the term ‘Electropop’ emerged, characterized by the use of electronic instruments to create catchy pop songs. Over time, Electropop evolved and influenced artists like David Bowie with his album 'Low' and Radiohead with ‘Kid A’. Electronic- Rock and  Pop both fuse electronic elements but their origins and influences diverge significantly. Electronic dance music (EDM) itself, an umbrella term for a wide array of styles, emerged in the mid-1980s. Characterized by its inorganic sounds, EDM is created primarily for dancing, with a strong emphasis on rhythm and beat. Notable styles within EDM include house, techno, drum and bass, dubstep, and trance.",
    "Folk": "Folk rock is a hybrid musical style that emerged in the mid-1960s in the United States and Britain. It blends the acoustic purity of folk with the evolving technology of pop music. This fusion transformed folk, adding a serious, introspective quality to its previously entertainment-focused nature. The pivotal moment came when Bob Dylan 'went electric' at the 1965 Newport Folk Festival, symbolizing the blending of folk and rock. Influences included the commercial folk-pop of artists like Harry Belafonte and the Kingston Trio.",
    "Indie": "In the world of indie rock, authenticity reigns. With a DIY ethos, artists fund their own studio time, crafting their sound in makeshift spaces or even their bedrooms. Embracing a lo-fi allure, indie recordings embody a rawness, untouched by digital editing. Indie rock, a subgenre of Alternative Rock, embraces a less mainstream sound and a DIY approach to recording and production. Drawing influences from Contemporary Folk to Punk, Indie Rock artists create Pop-informed songs with a raw and authentic feel, often writing and producing their music independently. Originating in the late 1970s, the term Indie initially referred to Punk and Post-Punk bands releasing music without major labels. Early successes like Buzzcocks' Spiral Scratch paved the way for independent record labels such as Rough Trade Records and 4AD Records. Throughout the 1980s, influential bands like The Smiths and R.E.M. popularized Jangle Pop and college Rock. ",
    "Jazz": "The Blues laid the groundwork for Jazz, influencing its melody and rhythm. As Jazz evolved, it intertwined with Rock music, giving birth to Jazz-Rock a fusion marked by modern Jazz improvisation blended with the bass lines, drumming styles, and instrumentation of Rock, often accentuated by electronic instruments and dance rhythms. Since the 1920s, there have been periodic fusions of Jazz and popular music, because of its vibrant energy against the melodic traits of popular music. By the 1960s, Jazz tunes began incorporating Rock rhythms, leading to a groundbreaking era in the 1970s. This era witnessed contrasting and complementary elements of Jazz and Rock converging in bands like Davis's, Williams's, McLaughlin's, Hancock's, Corea's, and Zawinul's. Jazz musicians such as flutist Herbie Mann, alto saxophonist Hank Crawford, and the Crusaders included original and standard Rock tunes over which they improvised Jazz. Their experimentation birthed a new Jazz-Rock idiom, drawing one of the largest Jazz audiences since the swing era.",
    "Latin": "The roots of Latin Jazz trace back to interactions between American and Cuban music styles. Jazz musicians embraced these influences as Latin American melodies and dance rhythms spread northward into the United States. In 1940, the Machito and the Afro-Cubans orchestra, led by Cuban-born trumpeter Mario Bauzá, marked a pivotal moment by blending jazz and Cuban music. Their hit song ‘Tanga’ is often considered the first true example of Latin jazz. Therefore, the two main categories are Afro-Cuban Jazz, which features a rhythm section employing ostinato patterns or a clave (a syncopated rhythmic pattern). The influence of Afro-Cuban music on early Jazz in New Orleans is often referred to as the “Spanish tinge” by musicians like Jelly Roll Morton. The second one is Afro-Brazilian Jazz, which includes samba and bossa nova. In the 1980s, Latin Pop emerged as a subgenre, with romantic ballads produced by legendary artists such as Julio Iglesias and Roberto Carlos, becoming increasingly popular in the United States during the 1970s.",
    "Metal": "Metal and rock, offspring of Rock n’ Roll, share common roots in the 19th century, with guitars and drums as their hallmark instruments. Yet, they diverge in sound and style. Rock boasts a melodious and diverse sound, embracing subgenres like classic rock, while Metal thrives on its aggressive and heavy demeanor, with subgenres like thrash and death metal. Lyrically, Metal delves into darker themes of death, rage, and existentialism, whereas Rock explores themes of love, social concerns, and storytelling. As some put it; Metal is the elimination of the Blues from Rock.",
    "Pop": "Pop music emerged during the mid-1950s in the United States and the United Kingdom. Initially, it encompassed Rock n’ Roll and other youth-oriented styles. Especially throughout the 1950s and 1960s, Pop music and Rock were closely intertwined, sharing common ground. The 60s/70s witnessed an even closer merger of pop music and rock as artists like The Beatles, The Beach Boys, and The Rolling Stones dominated music charts. Later on, Rock music especially faced competition from other genres like Dance, Hip-hop, and Electronic Music. Additionally, Pop became associated with music that was more commercial and accessible with its catchy melodies and more upbeat sound.",
    "Rap": "The relationship between Rock and Rap music has been influenced by racial undertones, mirroring historical segregation in music charts. Rap became more culturally accepted when white artists like the Beastie Boys and Eminem gained popularity, similar to how white musicians once found greater success covering songs by Black Soul and R&B artists. Despite societal barriers, Black Rap artists have always been rockstars. This context highlights the irony of Lil Wayne's venture into rock music. While some saw it as him stepping out of his lane, he was actually reclaiming his roots and breaking free from industry-imposed limitations. Additionally, Pop Rap is a fusion genre that emerged over time. It typically features simple, lighthearted, and radio-friendly lyrics. Early artists such as DJ Jazzy Jeff & The Fresh Prince and Heavy D & The Boyz made Hiphop with Pop appeal through humorous stories and family-oriented lyrics. As Rap entered the mainstream, more artists incorporated sung hooks and lighter themes, including rappers like The Notorious B.I.G., and 2Pac. ",
    "Reggae": "In the 1960s, Jamaican sound systems, mobile discos that introduced new music to the masses, sparked a cultural revolution. This era saw the birth of ska, known for its energetic beats and horn-driven melodies, which later slowed down to become Rocksteady. Rocksteady emphasized soulful melodies and intricate basslines, allowing artists to express socially and politically conscious lyrics about poverty, inequality, and social injustice. Rocksteady laid the foundation for reggae, a genre with a powerful message that influenced other musical styles. Reggae fusion emerged as artists like Sting, Eric Clapton, and UB40 incorporated reggae rhythms into Pop, Rock, and Funk, broadening its audience and popularity. Later on in the 1980s, Dancehall evolved within the reggae environment, embracing digital production techniques and creating a distinct sound. The introduction of ‘riddims’, instrumental tracks used by multiple artists for their own versions, became a hallmark of Dancehall, fostering a culture of collaboration and competition. Dancehall also reflected urban realities and social issues, becoming a vital platform for self-expression and the voices of the marginalized.",
    "Rock": "Rock is one of the most versatile and cross-tagged genres, encompassing a multitude of subgenres. Among these, it shares the most similarities and compatibility with Pop. Both genres evolved from Rock n’ Roll and draw from similar musical influences, aiming for broad appeal and often overlapping in their audiences. Their significant roles in shaping popular culture and influencing fashion, lifestyle, and social movements keep them intertwined and relevant. During the 1960s and 1970s, many bands blurred the lines between rock and pop. Iconic groups like The Beatles and The Rolling Stones had hits on both rock and pop charts, illustrating their crossover appeal. In general, Pop artists have ventured into Rock, and Rock artists into Pop, further blending the boundaries between them."
  };
  
  // Display description for selected genre
  function showGenreDescription(selectedGenre) {
    const descriptionDiv = document.getElementById('genreDescription');
    descriptionDiv.textContent = genreDescriptions[selectedGenre];
  }
  
  // Initialize dropdown 
  populateDropdown('genreDropdown', genres);
  document.getElementById('genreDropdown').addEventListener('change', function() {
    showGenreDescription(this.value); // Update description 
    createCompatibilityTable(top5Datasets, this.value); // Update table
  });

  // Default display when opening the page
  showGenreDescription(genres[0]);
  createCompatibilityTable(top5Datasets, 'Alternative');
});

// Reference Table setup: https://stackoverflow.com/questions/64949448/how-to-create-a-table-from-an-array-using-javascript
  function createCompatibilityTable(top5Datasets, selectedGenre) {
    const decades = ['1950', '1960', '1970', '1980', '1990', '2000'];
    // Find the index of the selected genre in the genres array
    const genreIndex = genres.indexOf(selectedGenre);

    // HTML string for table
    let table = '<table class="compatibility-table"><thead><tr>';
    // Adds decades to table
    table += decades.map(decade => `<th>${decade}</th>`).join('');
    table += '</tr></thead><tbody>';

    // Loop through top 5 datasets to create rows for each dataset
    for (let i = 0; i < 5; i++) {
      table += `<tr>`;
      // Adds a cell with genre image and percentage for each decade
      top5Datasets.forEach((decadeData, index) => {
        const data = decadeData[genreIndex][i];
        if (data) {
          // Calculate the image size based on the percentage, minimum size is 10px
          const imageSize = Math.max(10, data.percentage * 5);
          const genreImage = data.genre;
          // Add images to cells
          table += `<td><img src="imgs/${genreImage}.png" style="width: ${imageSize}px; height: ${imageSize}px;" alt="${genreImage}" onmouseover="showGenreInfo('${data.genre}', '${data.percentage}')" onmouseout="hideGenreInfo()"><br></td>`;
        } else {
          // No data -> empty cell
          table += '<td></td>';
        }
        
      });
      table += '</tr>';
    }
    table += '</tbody></table>';
    document.getElementById('compatibilityTable').innerHTML = table;
  }

function showGenreInfo(genre, percentage) {
  var genreInfoDiv = document.getElementById('genreInfo');
  genreInfoDiv.textContent = `${genre}: ${percentage}%`;
  genreInfoDiv.style.display = 'block'; // Show the div when hovering
}

function hideGenreInfo() {
  document.getElementById('genreInfo').style.display = 'none'; // Hide the div when not hovering
}