function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1) + min);
}
function randRgb(){
    return `rgb(${rand(0,254)}, ${rand(0,254)}, ${rand(0,254)})`
}
function clear(container){
    while (container.firstChild) {
        container.firstChild.remove()
    }
    if(container == document.body){
        document.body.className = ''
        document.body.removeEventListener('keydown', letBodyReloadOnEnterOnce)
    }// deletes all classes from document.body
}
function addControls(){
    document.addEventListener('keyup', function(e){
        if (e.code == 'Escape') {
            if (currentSceneIndex != 0) {
                loadMainMenu()
            }
        }
        else if (e.code == 'KeyE') {
            if (currentSceneIndex == 0 || currentSceneIndex == 1) {
                return
            }
            loadScene(currentSceneIndex)
        }
        for (let i = 1; i < 9; i++) {
            if (e.code == `Digit${i}`) {
                loadScene(i)
            }
        }
    })
}
function letBodyReloadOnEnterOnce(event){
    if (event.code == 'Enter') {
        loadScene(currentSceneIndex)
    }
}
function reloadScene(){
    loadScene(currentSceneIndex)
}

function Card(cardText, iconLink, sceneIndex = 0){
    this.element
    this.sceneIndex = sceneIndex
    this.cardText = cardText
    this.iconLink = iconLink
}
function Navigation(icon, id){
    this.element
    this.id = id
    this.icon = icon 
}
function Letter(letter, isActive = true){
    this.element
    this.letter = letter
    this.isActive = isActive
    Letter.prototype.disable = function(){
        // console.log('Works');
        this.element.style.border = '2px solid black'
        this.element.style.cursor = 'auto'
        this.isActive = false
        this.element.style.backgroundColor = 'grey'
    }//disable a letter
}


function loadMainMenu(){
    clear(document.body)
    currentSceneIndex = 0 //Tells us that we're in the main menu

    document.body.classList.toggle('mainPage')
    // document.body.style.flexDirection = 'column'
    let mainText = document.createElement('h1')
    mainText.innerText = 'Choose your game'
    document.body.append(mainText)
    let cardWrapper = document.createElement('div')
    cardWrapper.id = 'cardWrapper'

    cards.forEach(element => {
        let card = document.createElement('div')
        card.classList.add('card')
        let cardText = document.createElement('h2')
        cardText.innerText = element.cardText
        let icon = document.createElement('img')
        icon.setAttribute('src', element.iconLink)
        icon.setAttribute('alt', element.cardText)
        card.append(cardText)
        card.append(icon)
        element.element = card
        cardWrapper.append(card)
        let colorInterval
        card.addEventListener('mouseenter', ()=>{
            colorInterval = setInterval(()=>{
                card.style.borderWidth = '10px'
                setTimeout(()=>{
                    card.style.borderWidth = '5px'
                }, 250)
            }, 500)
        })
        card.addEventListener('mouseleave', ()=>{
            clearInterval(colorInterval)
            card.style.borderWidth = '2px'
        })
        
        card.addEventListener('click', ()=>{
            loadScene(element.sceneIndex)
        }) // loads a scene from a card's sceneIndex
    });
    document.body.append(cardWrapper)
}

function loadNavigation(){
    let navigation = document.createElement('div')
    navigation.id = 'nav'
    nav.forEach(element => {
        let n = document.createElement('div')
        let img = document.createElement('img')
        img.setAttribute('src', element.icon)
        n.append(img)
        n.id = element.id
        element.element = n

        switch(element.id){
            case 'home':
                n.addEventListener('click', loadMainMenu)
            break
            case 'reload':
                // console.log('done');
                n.addEventListener('click', reloadScene)
            break
        }
        navigation.append(n)
    });
    document.body.append(navigation)
}
function loadOutcome(won = true, word = null){
    let win = document.createElement('div')
    win.id = 'win'
    let winText = document.createElement('p')
    if (won) {
        winText.innerText = 'You won, good game!'
    }else{
        if(word == 'draw'){
            winText.innerText = `It's a draw, still a good game!`
        }
        else if(word){
            winText.innerText = `You lost ): Still a good game! The word was ${word}`
        }else{
            winText.innerText = `You lost ): Still a good game!`
        }
    }
    win.append(winText)
    let replay = document.createElement('p')
    replay.innerText = 'replay'
    replay.style.textDecoration = 'underline'
    replay.id = 'replay'
    replay.addEventListener('click', ()=>loadScene(currentSceneIndex))
    win.append(replay)
    document.body.append(win)
    document.body.addEventListener('keydown', letBodyReloadOnEnterOnce)
}

async function loadHangman(){
    clear(document.body)
    currentSceneIndex = 1
    document.body.classList.add('hangman')
    
    let hangerWrapper = document.createElement('div')
    hangerWrapper.id = 'hangerWrapper'
    document.body.append(hangerWrapper)
    let img = document.createElement('img')
    img.setAttribute('src', 'Pictures/Hangman/hangman-0.svg')
    hangerWrapper.append(img)
    
    let loading = document.createElement('p')
    loading.classList.add('loading')
    loading.innerText = 'Loading'
    for (let i = 0; i < 5; i++) {
        setTimeout(()=>{if(loading){loading.innerText += '.'}}, i*400)
    }
    hangerWrapper.append(loading)
    let response = await fetch('https://random-word-api.herokuapp.com/word')
    let word = await response.json()
    word = word[0]
    let descriptionText = 'Definition not found'
    let responseDescription = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    while(responseDescription.ok == false){
        response = await fetch('https://random-word-api.herokuapp.com/word')
        word = await response.json()
        word = word[0]
        responseDescription = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    }
    if (currentSceneIndex != 1) {
        return
    }
    loading.remove()
    descriptionText = await responseDescription.json()
    console.log(descriptionText);
    descriptionText = descriptionText[0].meanings[0].definitions[0].definition

    loadNavigation()
    
    {
        let wordWrapper = document.createElement('div')
        wordWrapper.id = 'wordWrapper'
        document.body.append(wordWrapper)

        let underscores = document.createElement('div')
        underscores.classList.add('underscores')
        let underscoresArray = []           
        for (let i = 0; i < word.length; i++) {
            let underscore = document.createElement('div')
            underscore.classList.add('underscore')
            underscore.innerText = '_'
            underscores.append(underscore)
            underscoresArray.push(underscore)
        }
        wordWrapper.append(underscores)

        let description = document.createElement('p')
        description.innerText = descriptionText
        wordWrapper.append(description)
        
        let letters = document.createElement('div')
        letters.classList.add('letters')
        let lettersArray = []
        let tries = 0
        for (let i = 'A'.charCodeAt(); i <= 'Z'.charCodeAt(); i++) {
            let letter = document.createElement('div')
            letter.classList.add('letter')
            letter.innerText = String.fromCharCode(i)
            let newLetter = new Letter(String.fromCharCode(i+32))
            newLetter.element = letter
            letters.append(letter)
            lettersArray.push(newLetter)

            newLetter.element.addEventListener('click', ()=>{
                if (newLetter.isActive) {
                    let found = false
                    for (let i = 0; i < word.length; i++) {
                        if(newLetter.letter == word[i]){
                            if (i==0) {
                                // underscoresArray[i].innerText = word[i]
                                underscoresArray[i].innerText = word[i].toUpperCase()
                            }else{
                                underscoresArray[i].innerText = word[i]
                            }
                            found = true
                        }
                    } 
                    if (found == false && tries < 6) {
                        tries++
                        img.setAttribute('src', `Pictures/Hangman/hangman-${tries}.svg`)
                    }
                    newLetter.disable()

                    let cleared = true
                    underscoresArray.forEach(element => {
                        if (element.innerText == '_') {
                            cleared = false
                        }
                    });
                    if (cleared) {
                        lettersArray.forEach(element => {
                            element.disable()
                        });
                        loadOutcome(true)
                    }
                    else if (tries >= 6) {
                        lettersArray.forEach(element => {
                            element.disable()
                        });
                        loadOutcome(false, word)
                    }
                }
            })
        }
        wordWrapper.append(letters)
    }
}

async function loadScramble(){
    clear(document.body)
    currentSceneIndex = 2
    document.body.classList.add('scramble')

    let wordLength = 5
    let nextLetter = 0
    letterContainerArray = []
    buttonLetterArray = []
    wordsArray = []

    let scrambleWrapper = document.createElement('div')
    scrambleWrapper.id = 'scrambleWrapper'
    
    let gridWrapper = document.createElement('div')
    gridWrapper.id = 'gridWrapper'
    scrambleWrapper.append(gridWrapper)

    let buttonWrapper = document.createElement('div')
    buttonWrapper.id = 'buttonWrapper'
    for (let i = 0; i < wordLength*wordLength; i++) {
        let newButton = document.createElement('button')
        newButton.classList.add('button')
        let letter = rand('a'.charCodeAt(), 'z'.charCodeAt())
        newButton.innerText = String.fromCharCode(letter)
        
        switch(rand(1,3)){
            case 1:
                newButton.style.backgroundColor = 'whitesmoke'
                break
            case 2:
                newButton.style.backgroundColor = '#7ead66'
                break
            case 3:
                newButton.style.backgroundColor = '#e3ba54'
                break
        }

        buttonLetterArray.push(newButton)
        
        newButton.onclick= function(){
            if (nextLetter < wordLength) {
                letterContainerArray[nextLetter].innerText = this.innerText
                letterContainerArray[nextLetter].classList.remove('next')
                setTimeout(()=>{letterContainerArray[nextLetter-1].style.fontSize = '2rem'})
                nextLetter++
                if (nextLetter < wordLength) {
                    letterContainerArray[nextLetter].classList.add('next')
                }
                // console.log(nextLetter);
            }
        }
        
        buttonWrapper.append(newButton)
    }
    gridWrapper.append(buttonWrapper)
    
    if (buttonLetterArray) {
        buttonLetterArray[rand(0, buttonLetterArray.length - 1)].innerText = 'a'
        buttonLetterArray[rand(0, buttonLetterArray.length - 1)].innerText = 'o'
    }

    let wordList = document.createElement('ol')
    wordList.id = 'wordList'
    gridWrapper.append(wordList)
    
    let keyboardWrapper = document.createElement('div')
    keyboardWrapper.id = 'keyboardWrapper'
    gridWrapper.append(keyboardWrapper)

    let word = document.createElement('div')
    word.id = 'word'
    for (let i = 0; i < wordLength; i++) {
        let newLetterContainer = document.createElement('div')
        newLetterContainer.classList.add('button')
        letterContainerArray.push(newLetterContainer)
        word.append(newLetterContainer)
    }
    letterContainerArray[nextLetter].classList.add('next')
    keyboardWrapper.append(word)
    
    let controls = document.createElement('button')
    controls.id = 'controls'
    let backscape = document.createElement('button')
    backscape.innerText = 'Backscape'
    backscape.id = 'backscape'
    backscape.classList.add('button')
    backscape.onclick = function(){
        if (nextLetter > 0) {
            if (nextLetter < wordLength) {
                letterContainerArray[nextLetter].classList.remove('next')
            }
            nextLetter--
            setTimeout(()=>{letterContainerArray[nextLetter].style.fontSize = '1rem'})
            letterContainerArray[nextLetter].classList.add('next')
            letterContainerArray[nextLetter].innerText = ''
            // console.log(nextLetter);
        }
    }
    controls.append(backscape)
    let enter = document.createElement('button')
    enter.innerText = 'Enter'
    enter.id = 'enter'
    enter.classList.add('button')
    controls.append(enter)
    enter.onclick = async function(){
        if (nextLetter == wordLength) {
            let word = ''
            letterContainerArray.forEach(element => {
                word+=element.innerText.toLowerCase() 
            });
            // console.log(w);
            let responseDescription = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            if (responseDescription.ok == false) {
                letterContainerArray.forEach(element => {
                    backscape.onclick()
                });
            }
            else{
                // console.log(await responseDescription.json());
                letterContainerArray.forEach(element => {
                    backscape.onclick()
                });
                let found = false
                wordsArray.forEach(element => {
                    if (element == word) {
                        found = true
                    }
                });
                if (found == false) {
                    wordsArray.push(word)
                    let p = document.createElement('li')
                    p.innerText = word
                    wordList.append(p)
                }
            }
        }
    }
    keyboardWrapper.append(controls)
    
    scrambleWrapper.append(keyboardWrapper)
    
    document.body.append(scrambleWrapper)
    loadNavigation()
}

function loadTicTac(){
    clear(document.body)
    currentSceneIndex = 3
    document.body.classList.add('tictac')
    let tilesArray = new Array(9)
    let canContinue = true

    let tictacWrapper = document.createElement('div')
    tictacWrapper.id = 'tictacWrapper'
    document.body.append(tictacWrapper)

    let field = document.createElement('div')
    field.id = 'field'
    tictacWrapper.append(field)

    for (let index = 0; index < tilesArray.length; index++) {
        let newTile = document.createElement('div')
        newTile.classList.add('tile')
        tilesArray[index] = newTile
        field.append(newTile)

        newTile.addEventListener('click', function(){
            function checkBoardForWin(){
                let done = false
                for (let i = 0; i < tilesArray.length; i++) {
                    switch(i){
                        case 0:
                            if (tilesArray[0].firstChild && tilesArray[1].firstChild && tilesArray[2].firstChild) {
                                if (tilesArray[0].firstChild.classList.contains('cross') && tilesArray[1].firstChild.classList.contains('cross') && tilesArray[2].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[0].firstChild.classList.contains('circle') && tilesArray[1].firstChild.classList.contains('circle') && tilesArray[2].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            if (tilesArray[0].firstChild && tilesArray[3].firstChild && tilesArray[6].firstChild) {
                                if (tilesArray[0].firstChild.classList.contains('cross') && tilesArray[3].firstChild.classList.contains('cross') && tilesArray[6].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[0].firstChild.classList.contains('circle') && tilesArray[3].firstChild.classList.contains('circle') && tilesArray[6].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            if (tilesArray[0].firstChild && tilesArray[4].firstChild && tilesArray[8].firstChild) {
                                if (tilesArray[0].firstChild.classList.contains('cross') && tilesArray[4].firstChild.classList.contains('cross') && tilesArray[8].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[0].firstChild.classList.contains('circle') && tilesArray[4].firstChild.classList.contains('circle') && tilesArray[8].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            break
                        case 1:
                            if (tilesArray[1].firstChild && tilesArray[4].firstChild && tilesArray[7].firstChild) {
                                if (tilesArray[1].firstChild.classList.contains('cross') && tilesArray[4].firstChild.classList.contains('cross') && tilesArray[7].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[1].firstChild.classList.contains('circle') && tilesArray[4].firstChild.classList.contains('circle') && tilesArray[7].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            break
                        case 2:
                            if (tilesArray[2].firstChild && tilesArray[5].firstChild && tilesArray[8].firstChild) {
                                if (tilesArray[2].firstChild.classList.contains('cross') && tilesArray[5].firstChild.classList.contains('cross') && tilesArray[8].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[2].firstChild.classList.contains('circle') && tilesArray[5].firstChild.classList.contains('circle') && tilesArray[8].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            if (tilesArray[2].firstChild && tilesArray[4].firstChild && tilesArray[6].firstChild) {
                                if (tilesArray[2].firstChild.classList.contains('cross') && tilesArray[4].firstChild.classList.contains('cross') && tilesArray[6].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[2].firstChild.classList.contains('circle') && tilesArray[4].firstChild.classList.contains('circle') && tilesArray[6].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            break
                        case 3:
                            if (tilesArray[3].firstChild && tilesArray[4].firstChild && tilesArray[5].firstChild) {
                                if (tilesArray[3].firstChild.classList.contains('cross') && tilesArray[4].firstChild.classList.contains('cross') && tilesArray[5].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[3].firstChild.classList.contains('circle') && tilesArray[4].firstChild.classList.contains('circle') && tilesArray[5].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            break
                        case 6:
                            if (tilesArray[6].firstChild && tilesArray[7].firstChild && tilesArray[8].firstChild) {
                                if (tilesArray[6].firstChild.classList.contains('cross') && tilesArray[7].firstChild.classList.contains('cross') && tilesArray[8].firstChild.classList.contains('cross')) {
                                    loadOutcome(true)
                                    canContinue = false
                                    done = true
                                }                                    
                                else if (tilesArray[6].firstChild.classList.contains('circle') && tilesArray[7].firstChild.classList.contains('circle') && tilesArray[8].firstChild.classList.contains('circle')) {
                                    loadOutcome(false)
                                    canContinue = false
                                    done = true
                                }                                    
                            }                                    
                            break
                    }
                }
                if (done == false) {
                    let tilesFull = 0
                    tilesArray.forEach(element => {
                        if (element.firstChild) {
                            tilesFull++
                        }
                    });
                    if (tilesFull == 9) {
                        loadOutcome(false, 'draw')
                    }
                }
            }
            
            if (!this.firstChild && canContinue) {

                let tilesFull = 0
                tilesArray.forEach(element => {
                    if (element.firstChild) {
                        tilesFull++
                    }
                });

                if (tilesFull < 9) {
                    let cross = document.createElement('img')
                    cross.setAttribute('src', 'Pictures/TicTacToe/cross.svg')
                    cross.classList.add('cross')
                    let circle = document.createElement('img')
                    circle.setAttribute('src', 'Pictures/TicTacToe/circle.svg')
                    circle.classList.add('circle')
                    this.append(cross)
                    setTimeout(()=>{
                        cross.style.height = '100%'
                        cross.style.width = '100%'
                        
                    })
                    setTimeout(()=>{
                        circle.style.height = '100%'
                        circle.style.width = '100%'
                    }, rand(100,300))

                    checkBoardForWin()

                    if (tilesFull != 8 && canContinue) {
                        let randTile = rand(0, tilesArray.length-1)
                        // console.log(randTile);
                        while(tilesArray[randTile].firstChild){
                            randTile = rand(0, 8)
                        }   
                        tilesArray[randTile].append(circle)
                    }
                }

                checkBoardForWin()
            }
        })
    }
    loadNavigation()
}

function loadSnake(){
    clear(document.body)
    document.body.classList.add('snake')
    currentSceneIndex = 4
    loadNavigation()

    let snakeWrapper = document.createElement('div')
    snakeWrapper.id = 'snakeWrapper'
    document.body.append(snakeWrapper)

    let boardColor = 'black'
    if (!localStorage.boardColor) {
        localStorage.setItem('boardColor', 'black')
        boardColor = localStorage.getItem('boardColor')
    }
    else{
        boardColor = localStorage.getItem('boardColor')
    }
    let tileSize = 30
    let rows = 25
    let columns = 30
    let velocityX = 0
    let velocityY = 0
    let snakeBody = []
    let paused = false
    let score = 0
    if (!localStorage.getItem('snakeHighScore')) {
        localStorage.setItem('snakeHighScore', '0')
    }
    let snakeHighScore = localStorage.getItem('snakeHighScore')
    snakeHighScore = parseInt(snakeHighScore)

    let scoreWrapper = document.createElement('div')
    scoreWrapper.id = 'scoreWrapper'
    snakeWrapper.append(scoreWrapper)

    let scoreText = document.createElement('p')
    scoreText.id = 'scoreText'
    scoreText.innerText = 'Score: ' + score
    scoreWrapper.append(scoreText)
    function updateScore(){
        score++
        scoreText.innerText = 'Score: ' + score
    }
    
    let highScoreText = document.createElement('p')
    highScoreText.id = 'highScoreText'
    highScoreText.innerText = 'High score: ' + snakeHighScore
    scoreWrapper.append(highScoreText)
    function updateHighScore(newScore){
        if (newScore > snakeHighScore) {
            snakeHighScore = newScore
            localStorage.setItem('snakeHighScore', snakeHighScore.toString())
            highScoreText.innerText = 'High score: ' + snakeHighScore
        }
    }

    let themeChangeText = document.createElement('p')
    themeChangeText.id = 'themeChangeText'
    themeChangeText.innerText = 'Change theme'
    themeChangeText.style.color = 'white'
    document.body.append(themeChangeText)
    themeChangeText.style.textShadow = '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000'
    themeChangeText.addEventListener('click', ()=>{
        if (boardColor == 'black') {
            boardColor = 'white'
            themeChangeText.style.color = 'black'
            localStorage.setItem('boardColor', boardColor)
            themeChangeText.style.textShadow = 'none'
        }
        else{
            boardColor = 'black'
            themeChangeText.style.color = 'white'
            localStorage.setItem('boardColor', boardColor)
            themeChangeText.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
        }
    })

    let pausedText = document.createElement('p')
    pausedText.id = 'pausedText'
    pausedText.innerText = 'PAUSED'
    document.body.append(pausedText)
    
    const board = document.createElement('canvas')
    board.width = tileSize*columns
    board.height = tileSize*rows
    snakeWrapper.append(board)
    const context = board.getContext('2d')
    

    let snakeX = tileSize * 7 
    let snakeY = tileSize * 5

    let foodX
    let foodY
    function placeFood(){
        foodX = rand(0,columns-1) * tileSize
        foodY = rand(0,rows-1) * tileSize
    }
    placeFood()

    function updateBoard(){
        if (paused) {
            pausedText.style.display = 'block'
            return
        }
        else{
            pausedText.style.display = 'none'
        }
        context.fillStyle = boardColor
        context.fillRect(0,0,board.width,board.height)

        if (snakeX == foodX && snakeY == foodY) {
            snakeBody.push([foodX,foodY])
            placeFood()
            updateScore()
            updateHighScore(score)
        }
        context.fillStyle = 'red'
        context.fillRect(foodX, foodY, tileSize, tileSize)
        context.fillStyle = 'brown'
        context.fillRect(foodX + 13, foodY, 4, -6)
        context.fillRect(foodX + 17, foodY-4, 4, -6)

        for (let i = snakeBody.length-1; i > 0; i--) {
            snakeBody[i] = snakeBody[i-1]
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY]
        }
        
        context.fillStyle = 'rgb(0, 80, 0)'
        snakeX+=velocityX * tileSize
        snakeY+=velocityY * tileSize
        context.fillRect(snakeX, snakeY, tileSize, tileSize)
        // for (let i = 0; i < snakeBody.length; i++) {
        //     context.fillRect(snakeBody[i][0], snakeBody[i][1], tileSize, tileSize)
        // }
        context.fillStyle = 'green'
        for (let i = 0; i < snakeBody.length; i++) {
            context.fillRect(snakeBody[i][0], snakeBody[i][1], tileSize, tileSize)
            context.fillStyle = 'rgb(0, 80, 0)'
            context.fillRect(snakeBody[i][0]+3, snakeBody[i][1]+3, tileSize-6, tileSize-6)
            context.fillStyle = 'green'
        }

        if (snakeX < 0 || snakeY < 0 || snakeX > (columns-1)*tileSize ||
            snakeY > (rows - 1)*tileSize) {
            loadOutcome(false)
            clearInterval(updateInterval)
            updateHighScore(score)
        }
        for (let i = 0; i < snakeBody.length; i++) {
            if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
                loadOutcome(false)
                clearInterval(updateInterval)
                updateHighScore(score)
            }
        }

    }
    let updateInterval = setInterval(updateBoard, 100)
    
    function changeDirection(event){
        switch(event.code){
            case 'KeyW':
            case 'ArrowUp':
                if (velocityY == 1) {
                    break
                }
                velocityX = 0
                velocityY = -1
                break
            case 'KeyS':
            case 'ArrowDown':
                if (velocityY == -1) {
                    break
                }
                velocityX = 0
                velocityY = 1
                break
            case 'KeyA':
            case 'ArrowLeft':
                if (velocityX == 1) {
                    break
                }
                velocityX = -1
                velocityY = 0
                break
            case 'KeyD':
            case 'ArrowRight':
                if (velocityX == -1) {
                    break
                }
                velocityX = 1
                velocityY = 0
                break
            case 'KeyP':
                if (paused) {
                    paused = !paused
                }
                else{
                    paused = !paused
                }
                break
        }
    }
    document.addEventListener('keydown', changeDirection)
}

function loadBattleship(){
    clear(document.body)
    document.body.classList.add('battleship')
    currentSceneIndex = 5
    loadNavigation()

    function Ship(length, startCoordinate, rotation){
        this.length = length
        this.startCoordinate = startCoordinate
        this.rotation = rotation
        this.randRotation = function(){
            let i = rand(0,1)
            switch(i){
                case 0:
                    this.rotation = 'down'
                    break
                case 1:
                    this.rotation = 'right'
                    break
            }
        }
        this.randShip = function(){
            this.length = rand(1,4)
            this.startCoordinate = [rand(0,9), rand(0,9)]
            this.randRotation()
        }
    }
    function occupyAroundTheCoordinate(coordX, coordY){
        if (rowsArray[coordY-1]){
            if (!rowsArray[coordY-1].children[coordX].classList.contains('ship')) {
                rowsArray[coordY-1].children[coordX].classList.add('occupied')
            }
            if (rowsArray[coordY-1].children[coordX+1]) {
                rowsArray[coordY-1].children[coordX+1].classList.add('occupied')
            }
            if (rowsArray[coordY-1].children[coordX-1]) {
                rowsArray[coordY-1].children[coordX-1].classList.add('occupied')
            }
        }
        if (rowsArray[coordY+1]){
            if (!rowsArray[coordY+1].children[coordX].classList.contains('ship')) {
                rowsArray[coordY+1].children[coordX].classList.add('occupied')
            }
            if (rowsArray[coordY+1].children[coordX+1]) {
                rowsArray[coordY+1].children[coordX+1].classList.add('occupied')
            }
            if (rowsArray[coordY+1].children[coordX-1]) {
                rowsArray[coordY+1].children[coordX-1].classList.add('occupied')
            }
        }
        if (rowsArray[coordY].children[coordX+1]) {
            if (!rowsArray[coordY].children[coordX+1].classList.contains('ship')) {
                rowsArray[coordY].children[coordX+1].classList.add('occupied')
            }
        }
        if (rowsArray[coordY].children[coordX-1]) {
            if (!rowsArray[coordY].children[coordX-1].classList.contains('ship')) {
                rowsArray[coordY].children[coordX-1].classList.add('occupied')
            }
        }
    }

    let battleshipWrapper = document.createElement('div')
    battleshipWrapper.id = 'battleshipWrapper'
    document.body.append(battleshipWrapper)

    let rows = 10
    let columns = 10

    let myBoard = document.createElement('tbody')
    myBoard.id = 'myBoard'
    myBoard.classList.add('board')
    battleshipWrapper.append(myBoard)

    let rowsArray = new Array(rows)
    for (let i = 0; i < rows; i++) {
        let newRow = document.createElement('tr')
        rowsArray[i] = newRow
        myBoard.append(newRow)
        newRow.classList.add('row')
        for (let i = 0; i < columns; i++) {
            let newTile = document.createElement('td')
            newTile.classList.add('tile')    
            newRow.append(newTile)
        }
    }

    function genShips(removeBorder = true) {
        for (let i = 0; i < 10; i++) {
            let newShip
            let newShipX = 0
            let newShipY = 0
            let rotation = ''
            let maxX
            let maxY
            let a
            switch(i){
                case 0:
                case 1:
                case 2:
                case 3:
                    newShipX = rand(0,9)
                    newShipY = rand(0,9)
                    while(rowsArray[newShipY].children[newShipX].classList.contains('occupied') ||
                    rowsArray[newShipY].children[newShipX].classList.contains('ship')) {
                        newShipX = rand(0,9)
                        newShipY = rand(0,9)
                    }
                    rowsArray[newShipY].children[newShipX].classList.add('ship')
                    occupyAroundTheCoordinate(newShipX,newShipY)
                    break
                case 4:
                case 5:
                case 6:
                    a = rand(0,1)
                    if (a == 1) {
                        rotation = 'down'
                        maxX = 9
                        maxY = 8
                    }else{
                        rotation = 'right'
                        maxX = 8
                        maxY = 9
                    }
                    newShipX = rand(0,maxX)
                    newShipY = rand(0,maxY)
                    if (rotation == 'down') {
                        while((rowsArray[newShipY].children[newShipX].classList.contains('occupied') ||
                        rowsArray[newShipY+1].children[newShipX].classList.contains('occupied')) 
                        || (rowsArray[newShipY].children[newShipX].classList.contains('ship') ||
                        rowsArray[newShipY+1].children[newShipX].classList.contains('ship'))) {
                            newShipX = rand(0,maxX)
                            newShipY = rand(0,maxY)
                        }
                        // console.log(newShipX, newShipY);
                        rowsArray[newShipY].children[newShipX].classList.add('ship')
                        rowsArray[newShipY+1].children[newShipX].classList.add('ship')
                        if (removeBorder) {
                            rowsArray[newShipY].children[newShipX].style.borderBottom = 'none'
                            rowsArray[newShipY+1].children[newShipX].style.borderTop = 'none'
                        }
                        occupyAroundTheCoordinate(newShipX, newShipY)
                        occupyAroundTheCoordinate(newShipX, newShipY+1)
                    }
                    else if (rotation == 'right') {
                        while((rowsArray[newShipY].children[newShipX].classList.contains('occupied') ||
                        rowsArray[newShipY].children[newShipX+1].classList.contains('occupied')) 
                        || (rowsArray[newShipY].children[newShipX].classList.contains('ship') ||
                        rowsArray[newShipY].children[newShipX+1].classList.contains('ship'))) {
                            newShipX = rand(0,maxX)
                            newShipY = rand(0,maxY)
                        }
                        // console.log(newShipX, newShipY);
                        rowsArray[newShipY].children[newShipX].classList.add('ship')
                        rowsArray[newShipY].children[newShipX+1].classList.add('ship')
                        if (removeBorder) {
                            rowsArray[newShipY].children[newShipX].style.borderRight = 'none'
                            rowsArray[newShipY].children[newShipX+1].style.borderLeft = 'none'
                        }
                        occupyAroundTheCoordinate(newShipX, newShipY)
                        occupyAroundTheCoordinate(newShipX+1, newShipY)
                    }
                    break
                case 7:
                case 8:
                    a = rand(0,1)
                    if (a == 1) {
                        rotation = 'down'
                        maxX = 9
                        maxY = 7
                    }else{
                        rotation = 'right'
                        maxX = 7
                        maxY = 9
                    }
                    newShipX = rand(0,maxX)
                    newShipY = rand(0,maxY)
                    if (rotation == 'down') {
                        let ocup = false
                        let shp = false
                        for (let i = 0; i < 3; i++) {
                            if (rowsArray[newShipY+i].children[newShipX].classList.contains('occupied')) {
                                ocup = true
                            }
                            else if (rowsArray[newShipY+i].children[newShipX].classList.contains('ship')) {
                                shp = true
                            }
                        }
                        while(ocup || shp) {
                            ocup = false
                            shp = false
                            newShipX = rand(0,maxX)
                            newShipY = rand(0,maxY)
                            for (let i = 0; i < 3; i++) {
                                if (rowsArray[newShipY+i].children[newShipX].classList.contains('occupied')) {
                                    ocup = true
                                }
                                else if (rowsArray[newShipY+i].children[newShipX].classList.contains('ship')) {
                                    shp = true
                                }
                            }
                        }
                        // console.log(newShipX, newShipY);
                        for (let i = 0; i < 3; i++) {
                            rowsArray[newShipY+i].children[newShipX].classList.add('ship')
                            if (removeBorder) {
                                switch(i){
                                    case 0:
                                        rowsArray[newShipY+i].children[newShipX].style.borderBottom = 'none'
                                        break
                                    case 1:
                                        rowsArray[newShipY+i].children[newShipX].style.borderBottom = 'none'
                                        rowsArray[newShipY+i].children[newShipX].style.borderTop = 'none'
                                        break
                                    case 2:
                                        rowsArray[newShipY+i].children[newShipX].style.borderTop = 'none'
                                        break
                                }
                            }
                        }
                        for (let i = 0; i < 3; i++) {
                            occupyAroundTheCoordinate(newShipX, newShipY+i)
                        }
                    }
                    else if (rotation == 'right') {
                        let ocup = false
                        let shp = false
                        for (let i = 0; i < 3; i++) {
                            if (rowsArray[newShipY].children[newShipX+i].classList.contains('occupied')) {
                                ocup = true
                            }
                            else if (rowsArray[newShipY].children[newShipX+i].classList.contains('ship')) {
                                shp = true
                            }
                        }
                        while(ocup || shp) {
                            ocup = false
                            shp = false
                            newShipX = rand(0,maxX)
                            newShipY = rand(0,maxY)
                            for (let i = 0; i < 3; i++) {
                                if (rowsArray[newShipY].children[newShipX+i].classList.contains('occupied')) {
                                    ocup = true
                                }
                                else if (rowsArray[newShipY].children[newShipX+i].classList.contains('ship')) {
                                    shp = true
                                }
                            }
                        }
                        // console.log(newShipX, newShipY);
                        for (let i = 0; i < 3; i++) {
                            rowsArray[newShipY].children[newShipX+i].classList.add('ship')
                            if (removeBorder) {
                                switch(i){
                                    case 0:
                                        rowsArray[newShipY].children[newShipX+i].style.borderRight = 'none'
                                        break
                                    case 1:
                                        rowsArray[newShipY].children[newShipX+i].style.borderRight = 'none'
                                        rowsArray[newShipY].children[newShipX+i].style.borderLeft = 'none'
                                        break
                                    case 2:
                                        rowsArray[newShipY].children[newShipX+i].style.borderLeft = 'none'
                                        break
                                }
                            }
                        }
                        for (let i = 0; i < 3; i++) {
                            occupyAroundTheCoordinate(newShipX+i, newShipY)
                        }
                    }
                    break
                case 9:
                    let shipPlaced = false
                    for (let i = 0; i < rowsArray.length-3; i++) {
                        if(!shipPlaced){
                            for (let k = 0; k < rowsArray[i].children.length-3; k++) {
                                let canPlaceShip = true
                                for (let f = 0; f < 4; f++) {
                                    if (rowsArray[i].children[k+f].classList.contains('occupied') ||
                                    rowsArray[i].children[k+f].classList.contains('ship')) {
                                        canPlaceShip = false
                                    }              
                                }
                                if (canPlaceShip) {
                                    shipPlaced = true
                                    for (let a = 0; a < 4; a++) {
                                        rowsArray[i].children[k+a].classList.add('ship')
                                        if (removeBorder) {
                                            switch(a){
                                                case 0:
                                                    rowsArray[i].children[k+a].style.borderRight = 'none'
                                                    break
                                                case 1:
                                                    rowsArray[i].children[k+a].style.borderRight = 'none'
                                                    rowsArray[i].children[k+a].style.borderLeft = 'none'
                                                    break
                                                case 2:
                                                    rowsArray[i].children[k+a].style.borderRight = 'none'
                                                    rowsArray[i].children[k+a].style.borderLeft = 'none'
                                                    break
                                                case 3:
                                                    rowsArray[i].children[k+a].style.borderLeft = 'none'
                                                    break
                                            }
                                        }
                                    }
                                    for (let c = 0; c < 4; c++) {
                                        occupyAroundTheCoordinate(k+c, i)
                                    }
                                }   
                            }
                        }
                    }
                    if (shipPlaced == false) {
                        for (let i = 0; i < rowsArray.length-3; i++) {
                            if(!shipPlaced){
                                for (let k = 0; k < rowsArray[i].children.length-3; k++) {
                                    let canPlaceShip = true
                                    for (let f = 0; f < 4; f++) {
                                        if (rowsArray[i+f].children[k].classList.contains('occupied') ||
                                        rowsArray[i+f].children[k].classList.contains('ship')) {
                                            canPlaceShip = false
                                        }              
                                    }
                                    if (canPlaceShip) {
                                        shipPlaced = true
                                        for (let a = 0; a < 4; a++) {
                                            rowsArray[i+a].children[k].classList.add('ship')
                                            if (removeBorder) {
                                                switch(a){
                                                    case 0:
                                                        rowsArray[i+a].children[k].style.borderBottom = 'none'
                                                        break
                                                    case 1:
                                                        rowsArray[i+a].children[k].style.borderBottom = 'none'
                                                        rowsArray[i+a].children[k].style.borderTop = 'none'
                                                        break
                                                    case 2:
                                                        rowsArray[i+a].children[k].style.borderBottom = 'none'
                                                        rowsArray[i+a].children[k].style.borderTop = 'none'
                                                        break
                                                    case 3:
                                                        rowsArray[i+a].children[k].style.borderTop = 'none'
                                                        break
                                                }
                                            }
                                        }
                                        for (let c = 0; c < 4; c++) {
                                            occupyAroundTheCoordinate(k, i+c)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break
            }
        }
    }
    genShips(true)
    
    let enemyBoard = document.createElement('tbody')
    enemyBoard.id = 'enemyBoard'
    enemyBoard.classList.add('board')
    battleshipWrapper.append(enemyBoard)

    let myRowsArray = rowsArray
    rowsArray = []

    function checkForTheShip(tile){
        let moved = false
        if (tile.classList.contains('ship')) {
            for (let i = 0; i < enemyShipArray.length; i++) {
                if(tile == enemyShipArray[i]){
                    enemyShipArray.splice(i,1)
                    let cross = document.createElement('img')
                    cross.setAttribute('src', 'Pictures/Battleship/crossed_out_red_box.svg')
                    cross.classList.add('crossed')
                    tile.append(cross)
                    tile.style.border = 'none'
                    tile.classList.remove('reactive')

                    let tileX
                    let tileY

                    for (let i = 0; i < rowsArray.length; i++) {
                        for (let a = 0; a < rowsArray[i].children.length; a++) {
                            if (tile == rowsArray[i].children[a]) {
                                tileX = a
                                tileY = i
                                break
                            }
                        }
                    }

                    function dotThisTile(y,x){
                        if (rowsArray[y].children[x]) {
                            if (!rowsArray[y].children[x].firstChild) {
                                let dot = document.createElement('img')
                                dot.setAttribute('src', 'Pictures/Battleship/dot.svg')
                                rowsArray[y].children[x].append(dot)
                                rowsArray[y].children[x].classList.remove('reactive')
                            }
                        }
                    }
                    
                    let thereIsUpperRow = false
                    let thereIsLowerRow = false
                    if (rowsArray[tileY-1]) {
                        dotThisTile(tileY-1, tileX-1)
                        dotThisTile(tileY-1, tileX+1)
                        thereIsUpperRow = true
                    }
                    if (rowsArray[tileY+1]) {
                        dotThisTile(tileY+1, tileX-1)
                        dotThisTile(tileY+1, tileX+1)
                        thereIsLowerRow = true
                    }
                    moved = false
                }
            }
            if (enemyShipArray.length == 0){
                loadOutcome(true)
                console.log('check for the ship outcome');
                for (let i = 0; i < rowsArray.length; i++) {
                    for (let a = 0; a < rowsArray[i].children.length; a++) {
                        rowsArray[i].children[a].classList.remove('reactive')
                    }
                }
            }
            return moved
        }

    }
    
    let tempArray = []
    let myTileArray = myBoard.querySelectorAll('.tile')
    let myShipArray = []
    for (let i = 0; i < myTileArray.length; i++) {
        if (!myTileArray[i].classList.contains('ship')) {
            tempArray.push(myTileArray[i])
        }else{
            myShipArray.push(myTileArray[i])
        }
    }
    myTileArray = tempArray
    // console.log(myTileArray);

    for (let i = 0; i < rows; i++) {
        let newRow = document.createElement('tr')
        rowsArray.push(newRow)
        enemyBoard.append(newRow)
        newRow.classList.add('row')
        for (let i = 0; i < columns; i++) {
            let newTile = document.createElement('td')
            newTile.classList.add('tile')
            newTile.classList.add('reactive')
            newTile.addEventListener('click', function(){                
                let iWon = false
                let iMoved = checkForTheShip(this)
                if (iMoved == true && enemyShipArray.length <= 0) {
                    iWon = true
                }

                if (!this.firstChild && this.classList.contains('reactive')) {
                    let dot = document.createElement('img')
                    dot.setAttribute('src', 'Pictures/Battleship/dot.svg')
                    this.append(dot)
                    this.classList.remove('reactive')
                    iMoved = true

                    if(myShipArray.length <= 0){
                        loadOutcome(false)
                        console.log('dot first child');
                        return
                    }
                }

                if (iMoved == true && iWon == false) { // enemy makes a move
                    let shipOrTile = rand(0,2)
                    // console.log(shipOrTile);
                    if (shipOrTile == 0) {
                        let randomTileIndex = rand(0, myShipArray.length-1)
                        let cross = document.createElement('img')
                        cross.setAttribute('src', 'Pictures/Battleship/crossed_out_red_box.svg')
                        cross.classList.add('crossed')
                        myShipArray[randomTileIndex].append(cross)
                        myShipArray[randomTileIndex].style.border = 'none'
                        myShipArray[randomTileIndex].classList.remove('reactive')
                        myShipArray.splice(randomTileIndex,1)
                    }
                    else{
                        let randomTileIndex = rand(0, myTileArray.length-1)
                        let dot = document.createElement('img')
                        dot.setAttribute('src', 'Pictures/Battleship/dot.svg')
                        myTileArray[randomTileIndex].append(dot)
                        myTileArray[randomTileIndex].classList.remove('reactive')
                        myTileArray.splice(randomTileIndex, 1)
                    }

                    if(myShipArray.length <= 0 && iWon == false){
                        loadOutcome(false)
                        console.log('after enemy making a move');
                        for (let i = 0; i < rowsArray.length; i++) {
                            for (let a = 0; a < rowsArray[i].children.length; a++) {
                                rowsArray[i].children[a].classList.remove('reactive')
                            }
                        }
                        return
                    }
                }
            })
            newRow.append(newTile)
        }
    }
    
    genShips(false)
    
    let enemyShipArray = enemyBoard.querySelectorAll('.ship')
    tempArray = []
    for (let i = 0; i < enemyShipArray.length; i++) {
        tempArray.push(enemyShipArray[i])
    }
    enemyShipArray = tempArray
}

function loadMinesweeper(){
    clear(document.body)
    document.body.classList.add('minesweeper')
    currentSceneIndex = 6
    loadNavigation()

    //sliders
    let parameterWrapper = document.createElement('div')
    parameterWrapper.id = 'parameterWrapper'
    document.body.append(parameterWrapper)
    
    let heightWrapper = document.createElement('div')
    heightWrapper.classList.add('parameterContainer')
    let heightSlider = document.createElement('input')
    heightSlider.setAttribute('type', 'range')
    heightSlider.setAttribute('min', '8')
    heightSlider.setAttribute('max', '36')
    heightSlider.setAttribute('step', '1')
    parameterWrapper.append(heightWrapper)
    heightWrapper.append(heightSlider)
    let heightText = document.createElement('p')
    heightText.innerText = 'Height: ' + heightSlider.value
    heightWrapper.append(heightText)
    
    let widthWrapper = document.createElement('div')
    widthWrapper.classList.add('parameterContainer')
    let widthSlider = document.createElement('input')
    widthSlider.setAttribute('type', 'range')
    widthSlider.setAttribute('min', '8')
    widthSlider.setAttribute('max', '66')
    widthSlider.setAttribute('step', '1')
    parameterWrapper.append(widthWrapper)
    widthWrapper.append(widthSlider)
    let widthText = document.createElement('p')
    widthText.innerText = 'Width: ' + widthSlider.value
    widthWrapper.append(widthText)
    
    let mineWrapper = document.createElement('div')
    mineWrapper.classList.add('parameterContainer')
    let mineSlider = document.createElement('input')
    mineSlider.setAttribute('type', 'range')
    mineSlider.setAttribute('min', '8')
    mineSlider.setAttribute('max', '40')
    mineSlider.setAttribute('step', '1')
    parameterWrapper.append(mineWrapper)
    mineWrapper.append(mineSlider)
    let mineText = document.createElement('p')
    mineText.innerText = 'Mines: ' + mineSlider.value
    mineWrapper.append(mineText)

    let updateButton = document.createElement('button')
    updateButton.onclick = updateBoard
    updateButton.id = 'updateButton'
    updateButton.innerText = 'update field'
    parameterWrapper.append(updateButton)
    //text update on slide
    let ar = [heightSlider, widthSlider, mineSlider]
    ar.forEach(element => {
        element.addEventListener("input", updateSliderText)
    });
   
    function updateSliderText(){
        heightText.innerText = 'Height: ' + heightSlider.value 
        widthText.innerText = 'Width: ' + widthSlider.value 
        mineText.innerText = 'Mines: ' + mineSlider.value
        
        height = parseInt(heightSlider.value)
        width = parseInt(widthSlider.value)
        mineNumber = parseInt(mineSlider.value)

        mineSlider.setAttribute('max', Math.floor(height*width*0.3))
        // console.log(height, width, mineNumber);
    }

    function click(e){
        if (isGameOver) {return}
        if (e.ctrlKey && this.classList.contains('closed')) {
            this.classList.remove('closed')
            this.classList.add('flag')
        }
        else if (e.ctrlKey && this.classList.contains('flag')) {
            this.classList.add('closed')
            this.classList.remove('flag')
        }
        else if(this.classList.contains('mine')){
            this.classList.add('mine_red')
            this.classList.remove('mine')
            this.classList.remove('closed')
            isGameOver = true
            // loadOutcome(false)
            tileArray.forEach(element => {
                if (element.classList.contains('mine')) {
                    element.classList.remove('flag')
                    element.classList.remove('closed')
                }
            })
        }
        else if (this.classList.contains('closed') || this.classList.contains('flag')) {
            this.classList.remove('closed')
            this.classList.remove('flag')
            if (this.getAttribute('data') == 0) {
                let id = parseInt(this.id)
                const isLeftEdge = (id%width === 0)
                const isRightEdge = (id%width === width-1)
                setTimeout(function(){
                    if (id > 0 && !isLeftEdge) {
                        let event = new Event('click')
                        tileArray[id-1].dispatchEvent(event)
                    }
                    if (id > width-1 && !isRightEdge) {
                        let event = new Event('click')
                        tileArray[id+1-width].dispatchEvent(event)
                    }
                    if (id > width-1) {
                        let event = new Event('click')
                        tileArray[id-width].dispatchEvent(event)
                    }
                    if (id > width && !isLeftEdge) {
                        let event = new Event('click')
                        tileArray[id-width-1].dispatchEvent(event)
                    }
                    if (id < width*height-1 && !isRightEdge) {
                        let event = new Event('click')
                        tileArray[id+1].dispatchEvent(event)
                    }
                    if (id < width*height-width && !isLeftEdge) {
                        let event = new Event('click')
                        tileArray[id-1+width].dispatchEvent(event)
                    }
                    if (id < width*height-width-1 && !isRightEdge) {
                        let event = new Event('click')
                        tileArray[id+1+width].dispatchEvent(event)
                    }
                    if (id < width*height-width) {
                        let event = new Event('click')
                        tileArray[id+width].dispatchEvent(event)
                    }
                }, 5)
            }
            let closed = 0
            for (let i = 0; i < tileArray.length; i++) {
                if (tileArray[i].classList.contains('closed')||tileArray[i].classList.contains('flag')) {
                    closed++
                }
            }
            console.log(closed);
            if (closed == mineNumber) {
                isGameOver = true
                loadOutcome(true)
            }
        }      
    }
    
    function updateBoard(){
        clear(board)
        board.style.width = `${widthSlider.value*tileSize}px`
        board.style.height = `${heightSlider.value*tileSize}px`

        let mineArray = Array(mineNumber).fill('mine')
        let emptyArray = Array(width*height - mineNumber).fill('clear')
        let gameArray = emptyArray.concat(mineArray)
        let shuffledArray = gameArray.sort(()=>Math.random() - 0.5)

        tileArray = []
        for (let i = 0; i < heightSlider.value*widthSlider.value; i++) {
            let newTile = document.createElement('div')
            newTile.classList.add('tile')
            newTile.classList.add(shuffledArray[i])
            newTile.classList.add('closed')
            newTile.id = i
            board.append(newTile)
            tileArray.push(newTile)

            newTile.addEventListener('click', click)
        }
        
        for (let i = 0; i < tileArray.length; i++) {
            let totalBombs = 0
            const isLeftEdge = (i%width === 0)
            const isRightEdge = (i%width === width-1)

            if (i>0 && !isLeftEdge && tileArray[i-1].classList.contains('mine')) {
                totalBombs++
            }
            if (i>width-1 && !isRightEdge && tileArray[i+1-width].classList.contains('mine')) {
                totalBombs++
            }
            if (i>width-1 && tileArray[i-width].classList.contains('mine')) {
                totalBombs++
            }
            if (i>width && !isLeftEdge && tileArray[i-width-1].classList.contains('mine')) {
                totalBombs++
            }
            if (i<width*height-1 && !isRightEdge && tileArray[i+1].classList.contains('mine')) {
                totalBombs++
            }
            if (i<width*height-width && !isLeftEdge && tileArray[i-1+width].classList.contains('mine')) {
                totalBombs++
            }
            if (i<width*height-width-1 && !isRightEdge && tileArray[i+1+width].classList.contains('mine')) {
                totalBombs++
            }
            if (i<width*height-width && tileArray[i+width].classList.contains('mine')) {
                totalBombs++
            }
            if (tileArray[i].classList.contains('clear')) {
                tileArray[i].classList.remove('clear')
                tileArray[i].classList.add(`type${totalBombs}`)
            }
            tileArray[i].setAttribute('data', totalBombs)
        }
        isGameOver = false
    }
    heightSlider.onchange = updateBoard
    widthSlider.onchange = updateBoard
    mineSlider.onchange = updateBoard

    //the field
    let tileSize = 24
    let height = 10
    let width = 10
    let mineNumber = 20
    let tileArray = []
    let isGameOver = false
    
    let inputWrapper = document.createElement('div')
    inputWrapper.id = 'inputMinesweeper'
    document.body.append(inputWrapper)
    
    let minsweeperWrapper = document.createElement('div')
    minsweeperWrapper.id = 'minesweeperWrapper'
    document.body.append(minsweeperWrapper)

    let board = document.createElement('div')
    board.id = 'board'
    minsweeperWrapper.append(board)

    heightSlider.value = 10
    widthSlider.value = 10
    mineSlider.value = 20

    function updateGame(){
        updateSliderText()
        updateBoard()
    }
    updateGame()
}

function load2048(){
    clear(document.body)
    currentSceneIndex = 7
    document.body.classList.add('g2048')
    loadNavigation()

    let elementRows = []
    let rows = []
    let width = 0
    let tileSize = 100

    let widthWrapper = document.createElement('div')
    widthWrapper.id = 'widthWrapper'
    
    let widthSlider = document.createElement('input')
    widthSlider.setAttribute('type', 'range')
    widthSlider.setAttribute('min', '4')
    widthSlider.setAttribute('max', '10')
    widthSlider.setAttribute('step', '1')
    widthWrapper.append(widthSlider)
    document.body.append(widthWrapper)
    let widthText = document.createElement('p')
    widthText.innerText = 'Width: ' + widthSlider.value
    widthWrapper.append(widthText)
    widthSlider.value = 4
    width = widthSlider.value

    widthSlider.addEventListener("input", updateSliderText)
    function updateSliderText(){
        widthText.innerText = 'Width: ' + widthSlider.value 
        
        width = parseInt(widthSlider.value)
    }
    updateSliderText()

    widthSlider.onchange = function(){
        clear(board)
        width = widthSlider.value
        if(width >= 4 && width <= 9){
            tileSize = 100
        }else{
            tileSize = 85
        }
        rows = []
        console.log(width);
        updateBoard()
    }
    
    let wrapperOf2048 = document.createElement('div')
    wrapperOf2048.id = 'wrapperOf2048'
    document.body.append(wrapperOf2048)

    let board = document.createElement('div')
    board.id = 'board'
    wrapperOf2048.append(board)

    function updateTile(tile, num) {
        tile.innerText = ''
        tile.classList.value = ''
        tile.classList.add('tile')
        if (width == 10) {
            tile.style.fontSize = '200%'
        }
        if (num > 0) {
            tile.innerText = num
            if (num <= 4096) {
                tile.classList.add(`x${num}`)
            } else {
                tile.classList.add('x8192')
            }                
        }
    }

    function isEmpty(){
        for (let i = 0; i < width; i++) {
            for (let k = 0; k < width; k++) {
                if (rows[i][k] == 0) {
                    return true
                }       
            }
        }
        return false
    }

    function randTile() {
        if (!isEmpty()) {
            return
        }
        let found = false
        while (!found) {
            let x = rand(0, width-1)
            let y = rand(0, width-1)
            if (rows[y][x] == 0) {
                rows[y][x] = 2;
                updateTile(document.getElementById(`${y}-${x}`), 2)
                found = true;
            }
        }
    }

    function updateBoard(){
        for (let i = 0; i < width; i++) {
            rows[i] = []
            
            let newRow = document.createElement('div')
            newRow.classList.add('row')
            board.append(newRow)
            
            for (let k = 0; k < width; k++) {
                rows[i][k] = 0
                let newTile = document.createElement('div')
                newTile.id = `${i}-${k}`
                newTile.style.height = `${tileSize}px`
                newTile.style.width = `${tileSize}px`

                if (i != width && i != width-1) {
                    newTile.style.borderBottom = 'none'
                }
                if (k != width-1 && k != width) {
                    newTile.style.borderRight = 'none'
                }
                if (i == 0 && k == 0) {
                    newTile.style.borderRadius = '10% 0 0 0'
                    // newTile.classList.add('roundULC')
                }
                else if (i == 0 && k == width-1) {
                    newTile.style.borderRadius = '0 10% 0 0'
                    // newTile.classList.add('roundURC')
                }
                else if (i == width-1 && k == width-1) {
                    newTile.style.borderRadius = '0 0 10% 0'
                    // newTile.classList.add('roundLRC')
                }
                else if (i == width-1 && k == 0) {
                    newTile.style.borderRadius = '0 0 0 10%'
                    // newTile.classList.add('roundLLC')
                }
                
                let num = rows[i][k]
                updateTile(newTile, num)
                newRow.append(newTile)
            }
        }
        // rows[0][0] = 8192
        // updateTile(document.getElementById('0-0'), 8192)


        randTile()
        randTile()

        console.log(rows);
    }

    updateBoard()

    function filterZeroes(row){
        return row.filter(num => num != 0) // not this nans
    }

    function slide(row) {
        row = filterZeroes(row)
        for (let i = 0; i < row.length-1; i++){
            if (row[i] == row[i+1]) {
                row[i] *= 2
                row[i+1] = 0
            }
        }
        row = filterZeroes(row)
        while (row.length < width) {
            row.push(0)
        }
        return row
    }

    function slideLeft(){
        for (let i = 0; i < width; i++) {
            let row = rows[i]
            row = slide(row)
            rows[i] = row
            for (let k = 0; k < width; k++) {
                let num = rows[i][k]
                updateTile(document.getElementById(`${i}-${k}`), num)
            }
        }
    }

    function slideRight(){
        for (let i = 0; i < width; i++) {
            let row = rows[i]
            row.reverse()
            row = slide(row)
            rows[i] = row.reverse()
            for (let k = 0; k < width; k++) {
                let num = rows[i][k]
                updateTile(document.getElementById(`${i}-${k}`), num)
            }
        }
    }

    function slideUp(){
        let row = []
        for (let i = 0; i < width; i++) {
            row = []
            for (let k = 0; k < width; k++) {
                row.push(rows[k][i])
            }
            row = slide(row)
            for (let k = 0; k < width; k++) {
                rows[k][i] = row[k]
                let num = rows[k][i]
                updateTile(document.getElementById(`${k}-${i}`), num)
            }
        }
    }
    
    function slideDown(){
        let row = []
        for (let i = 0; i < width; i++) {
            row = []
            for (let k = 0; k < width; k++) {
                row.push(rows[k][i])
            }
            row.reverse()
            row = slide(row)
            row.reverse()
            for (let k = 0; k < width; k++) {
                rows[k][i] = row[k]
                let num = rows[k][i]
                updateTile(document.getElementById(`${k}-${i}`), num)
            }
        }
    }

    function checkForWin(){
        rows.forEach(element => {
            element.forEach(element =>{
                if(element == 2048){
                    loadOutcome(true)
                }
            })
        });
    }

    document.addEventListener('keyup', function(e){
        if (currentSceneIndex != 7) {
            return
        }
        if (e.code == 'ArrowLeft') {
            slideLeft()
            randTile()
        }
        else if (e.code == 'ArrowRight') {
            slideRight()
            randTile()
        }
        else if (e.code == 'ArrowUp') {
            slideUp()
            randTile()
        }
        else if (e.code == 'ArrowDown') {
            slideDown()
            randTile()
        }
        checkForWin()
    })
}

function loadSlidePuzzle(){
    clear(document.body)
    currentSceneIndex = 8
    document.body.classList.add('slidePuzzle')
    loadNavigation()

    let dragText = document.createElement('h1')
    dragText.innerText = 'Drag pieces to make a picture!'
    
    let puzzleWrapper = document.createElement('div')
    puzzleWrapper.id = 'puzzleWrapper'
    document.body.append(puzzleWrapper)
    puzzleWrapper.append(dragText)

    let board = document.createElement('div')
    board.id = 'board'
    puzzleWrapper.append(board)

    let currentTile
    let otherTile
    // let imgOrder = [2,1,0,3,5,7,4,6,8]
    let imgOrder = []
    console.log(imgOrder.indexOf(1));
    for (let i = 0; i < 9; i++) {
        let newNum = rand(0,8)
        while(imgOrder.includes(newNum)){
            newNum = rand(0,8)
        }
        imgOrder[i] = newNum
    }
    console.log(imgOrder);
    let picture = rand(1,6)
    let moves = 0
    
    let rows = 3
    let columns = 3

    // for (let i = 0; i < 9; i++) {
    //     let newTile = document.createElement('img')
    //     newTile.classList.add('tile')
    //     newTile.setAttribute('src', `Pictures/SlidePuzzle/Spider-man/${i}.jpg`)
    //     board.append(newTile)
    // }
    function dragStart(){
        currentTile = this
    }
    function dragDrop(){
        otherTile = this
    }
    function dragEnd(){
        let coordinates = currentTile.id.split('-')
        let r = parseInt(coordinates[0])
        let c = parseInt(coordinates[1])
        
        let otherCoordinates = otherTile.id.split('-')
        let r2 = parseInt(otherCoordinates[0])
        let c2 = parseInt(otherCoordinates[1])

        let moveLeft = r == r2 && c == c2-1
        let moveRight = r == r2 && c == c2+1
        let moveUp = c == c2 && r2 == r-1
        let moveDown = c == c2 && r2 == r+1
        let canMove = moveLeft || moveRight || moveUp || moveDown

        if (canMove) {
            let currentImage = currentTile.src
            let otherImage = otherTile.src
    
            currentTile.src = otherImage
            otherTile.src = currentImage

            moves++
            dragText.innerText = 'Moves: ' + moves
        }
    }
    function dragOver(e){
        e.preventDefault()
    }
    function dragEnter(e){
        e.preventDefault()
    }
    function dragLeave(e){
        e.preventDefault()
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let newTile = document.createElement('img')
            newTile.classList.add('tile')
            newTile.id = `${r}-${c}`

            newTile.addEventListener('dragstart', dragStart)
            newTile.addEventListener('dragover', dragOver)
            newTile.addEventListener('dragenter', dragEnter)
            newTile.addEventListener('dragleave', dragLeave)
            newTile.addEventListener('drop', dragDrop)
            newTile.addEventListener('dragend', dragEnd)
            
            newTile.src = `Pictures/SlidePuzzle/${picture}/` + imgOrder.shift() + '.jpg'
            board.append(newTile)
        }
    }

}

function loadScene(sceneIndex){
    // console.log('Loaded a new scene!');
    switch(sceneIndex){
        case 0:
            loadMainMenu()
            break
        case 1:
            loadHangman()
            break
        case 2:
            loadScramble()
            break
        case 3:
            loadTicTac()
            break
        case 4:
            loadSnake()
            break
        case 5:
            loadBattleship()
            break
        case 6:
            loadMinesweeper()
            break
        case 7:
            load2048()
            break
        case 8:
            loadSlidePuzzle()
            break
    } 
    // console.log('currentSceneIndex: ' + currentSceneIndex);
}// loads a scene based on its sceneIndex

let cards = [
    new Card('Hangman', 'Pictures/hangman_icon.svg', 1),
    new Card('Scramble', 'Pictures/scramble.svg', 2),
    new Card('Tic-tac-toe', 'Pictures/tic_tac.svg', 3),
    new Card('Snake', 'Pictures/snake.svg', 4),
    new Card('Battleship', 'Pictures/battleship_icon2.svg', 5),
    new Card('Minesweeper', 'Pictures/minesweeper_icon.svg', 6),
    new Card('2048', 'Pictures/2048_icon2.svg', 7),
    new Card('Slide Puzzle', 'Pictures/slide_puzzle_icon2.svg', 8)
]
let nav = [
    new Navigation('Pictures/home.svg', 'home'),
    new Navigation('Pictures/reload.svg', 'reload')
]

setInterval(()=>{
    document.body.style.backgroundColor = randRgb()
}, 6000)

let currentSceneIndex = 0

addControls()

loadMainMenu()