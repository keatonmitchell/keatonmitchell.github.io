let seed;
// seed = 245752758
// seed = 203858128
// seed = 170760328
// seed = 820469067 a glitchy one if you want to fix it

let randomPoints = [];
let perlinPoints = [];
let groundPoints = [];

let trueGroundPoints = [];
let riverX = [];
let riverY = [];

let lakeTilesX = [];
let lakeTilesY = [];
let lakeEdgeX = [];
let lakeEdgeY = [];
let lakeHeights = [];
let lakeHeight;
let lakeSize;
let lakeVolume;

let addedLakeHeights = [15, 55, 90, 115, 145]
let lakeHeightIndex = -1;

let runtimeForNextDisplay = 0;
let establishNextRuntime = false;
let displayTimeIncrement = 1200;

let lakeScale = 8;
let lakeHeightConstant = 25;
let previousLakeHeight = 0;

let houseX, houseY;

let peopleX = [];
let peopleY = [];

let groundGraphics, topoGraphics, playerGraphics;

let globalXVariable, globalYVariable;

let sortedGenerationPoints = [];
let generationPoints = [];

let perlinScale = 6;
let randomExtremity = 20;

let lowestValue = 100, highestValue = 0;
let highestX, highestY, lowestX, lowestY;

let topoDensity = 4;
let fancyTopoDensity = 4;
let mapScale = 2;

let frameCount = 0;
let previousDeltaTime = 0;

let myWidth, myHeight;

let keyImage, compassImage;

let randomSeed;

let finalizedGraphics = [];
let sixtyFrameTime;
let runtime = 0;

{
  function isNumber(num){
    return (num > 0 || num <= 0) && typeof num == 'number';
  }
  
  function isRealNumber(num){
    return typeof num == 'number' && (num < 0 || num >= 0) && (num != Infinity || num != -Infinity);
  }
  
  function randRange(min, max){
    return myRandom() * (max - min) + min;
  }
  function randRangeInt(min, max){
    return Math.floor(myRandom() * (max - min + 1) + min);
  }

  function myRandom(){
    seed = (Math.floor(seed*271269315) + 18567156896123) % Math.pow(2, 32);
    return seed / Math.pow(2, 32);
  }
}

function preload(){
  // keyImage = loadImage("MapKey.png");
  compassImage = loadImage("compass.png");
}

function setup(){
  if(!seed) seed = Math.floor(Math.random() * 999999999);
  console.log(Math.floor(seed/1000000), Math.floor(seed/1000) % 1000, seed % 1000)
  myWidth = Math.floor((windowWidth-24)/mapScale); Math.floor(myHeight = (windowHeight-24)/mapScale);
  myWidth  -= myWidth  % (lakeScale*mapScale) - 1;
  myHeight -= myHeight % (lakeScale*mapScale) - 1;
  // myWidth = 150, myHeight = 100;
  createCanvas(mapScale*myWidth, myHeight*mapScale)
}

function draw(){

  frameCount++;
  if(deltaTime > 50) console.log(frameCount, deltaTime);
  previousDeltaTime = deltaTime;

  runtime += Math.min(deltaTime, 300);
  if(frameCount === 60) sixtyFrameTime = runtime;

  if(establishNextRuntime) {
    runtimeForNextDisplay = runtime + displayTimeIncrement;
    establishNextRuntime = false;
  }

  if(frameCount === 1){
    textSize(30);
    text("loading...", 20, 40);
  }
  if(frameCount === 10){
    for(let i = 0; i <= myWidth; i++){
      randomPoints.push([]);
      for(let j = 0; j <= myHeight; j++){
        randomPoints[i].push("no data");
      }
    }
  
    for(let i = 0; i < myWidth*myHeight; i++){
      sortedGenerationPoints.push(i);
    }
    
    for(let i = myWidth*myHeight-1; i >= myWidth*myHeight * 3/4; i--){
      let index = randRangeInt(0, i);
      generationPoints.push(sortedGenerationPoints[index]);
      sortedGenerationPoints.splice(index, 1);
    }
  }
  else if (frameCount === 20){
    for(let i of generationPoints){

      let x = i % myWidth;
      let y = Math.floor(i / myWidth);
      console.assert(randomPoints[x][y] === "no data")

      let numReferencePoints = 0;
      let sumOfReferencePoints = 0;
      let perlinPart = 15;
      for(let xOffset = -perlinPart; xOffset <= perlinPart; xOffset++){
        for(let yOffset = -perlinPart; yOffset <= perlinPart; yOffset++){

          if(x+xOffset < 0 || y+yOffset < 0 || x+xOffset >= myWidth-1 || y+yOffset >= myHeight-1) continue;
          if(randomPoints[x+xOffset][y+yOffset] === "no data") continue
          console.assert(isNumber(randomPoints[x+xOffset][y+yOffset]))

          numReferencePoints++;
          sumOfReferencePoints += randomPoints[x+xOffset][y+yOffset];
        }
      }

      let randomValue = randRange(-randomExtremity, randomExtremity);
      
      if(numReferencePoints === 0){
        sumOfReferencePoints = 0;

        let distanceFromEdge = Math.max(
          Math.min(x, myWidth/2), 
          Math.min(y, myHeight/2), 
          Math.min(myWidth-x, myWidth/2), 
          Math.min(myHeight-y, myHeight/2));
        
        let maxDistance = Math.max(mapScale*myWidth/2, mapScale*myHeight/2)
        let distanceValue = Math.pow(distanceFromEdge/maxDistance, 1) * 350
        randomValue = randRange(-distanceValue, distanceValue);
        // randomValue = randRange(-100, 100)
      }
      else{
        sumOfReferencePoints /= numReferencePoints;
      }


      randomPoints[x][y] = randomValue + sumOfReferencePoints;

      // let proximityToEdge = Math.min(x, y, myWidth-x, myHeight-y);
      // randomPoints[x][y] = randomPoints[x][y] * (proximityToEdge) / (proximityToEdge+.3);
    }
  }
  else if (frameCount === 30){

    for(let x = 0; x <= myWidth; x++){
      perlinPoints.push([]);
      // console.log("Y", y);
  
      for(let y = 0; y <= myHeight; y++){
        // console.log("X", x);
        perlinPoints[x].push(perlinify(randomPoints, x, y));
        
      }
    }

    let edgeThreshold = 10;
    for(let x in perlinPoints){
      for(let y in perlinPoints[x]){
        
        if(x < edgeThreshold || y < edgeThreshold || myWidth - x < edgeThreshold || myHeight - y < edgeThreshold)
          continue;

        if(perlinPoints[x][y] > highestValue) {
          highestValue = perlinPoints[x][y];
          highestX = x;
          highestY = y;
        }
        if(perlinPoints[x][y] < lowestValue)  {
          lowestValue  = perlinPoints[x][y];
          lowestX = x;
          lowestY = y;
        }
      }
    }
  
    lowestValue += 10;
    highestValue -= 10;
  }
  else if (frameCount === 35){

    
    // let maxLookRange = 6;
    // for(let i = 0; i < 4; i++){

    //   let lowestX, lowestY, lowestValue = 999;
    //   for(let x = Math.floor(myWidth/2*(i%2 === 0)); x < myWidth/2 + myWidth/2*(i%2 === 0); x++){
    //     for(let y = Math.floor(myHeight/2*(i%4 > 1)); y < myHeight/2 + myHeight/2*(i%4 > 1); y++){
    //         if(perlinPoints[x][y] < lowestValue)  {
    //         lowestValue  = perlinPoints[x][y];
    //         lowestX = x;
    //         lowestY = y;
    //       } 
    //     }
    //   }

    //   makeRiver(i, lowestX, lowestY, maxLookRange);

    //   // startX = Math.floor(randRangeInt(0,  myWidth*1/2)  + myWidth/2*(i%2 === 0)); 
    //   // startY = Math.floor(randRangeInt(0, myHeight*1/2) + myHeight/2*(i%4 > 1));

    // }

    // for(let i in riverX){
    //   for(let j in riverX[i]){
    //     let x = riverX[i][j];
    //     let y = riverY[i][j];
  
    //     let lookRange = 100;
    //     for(let xOffset = -lookRange; xOffset <= lookRange; xOffset++){
    //       for(let yOffset = -lookRange; yOffset <= lookRange; yOffset++){
    //         if(x + xOffset >= myWidth || x + xOffset < 0 || y + yOffset >= myHeight || y + yOffset < 0)
    //           continue;
  
    //         let distanceFromRiver = Math.sqrt(xOffset*xOffset + yOffset*yOffset);
    //         if(distanceFromRiver > lookRange) continue;
    //         perlinPoints[x+xOffset][y+yOffset] -= 8/(distanceFromRiver+1)*Math.sqrt(i/Math.pow(riverX.length, 0.9));
    //       }
    //     }
    //   } 

    // }
  }
  else if (frameCount === 40){
    groundGraphics = createGraphics(mapScale*myWidth, mapScale*myHeight);
    groundGraphics.noStroke();

    for(let x = 0; x <= mapScale*myWidth; x++){
      groundPoints.push([]);
      trueGroundPoints.push([])
      
      for(let y = 0; y <= mapScale*myHeight; y++){
        let perlinX = Math.floor(x / mapScale);
        let perlinY = Math.floor(y / mapScale);
        if(perlinX === myWidth || perlinY === myHeight) continue;

        let xOffset = x % mapScale / mapScale;
        let yOffset = y % mapScale / mapScale;

        // console.log(perlinX, perlinY)

        let pointBrightness = (perlinPoints[perlinX][perlinY]    * ((1-xOffset) * (1-yOffset)) + 
                              perlinPoints[perlinX][perlinY+1]   * ((1-xOffset) *    yOffset) + 
                              perlinPoints[perlinX+1][perlinY]   * (xOffset     * (1-yOffset)) + 
                              perlinPoints[perlinX+1][perlinY+1] * (xOffset *        yOffset));

        trueGroundPoints[x].push(pointBrightness);

        pointBrightness = (pointBrightness - lowestValue) / (highestValue - lowestValue) * (100-20) + 20;
        pointBrightness = pointBrightness - pointBrightness % topoDensity;

        groundPoints[x].push(pointBrightness);

        let r, g, b;
        if(pointBrightness < 50){
          r = pointBrightness * 305 / 50 - 50;
          g = pointBrightness * 50 / 50;
          b = 0;
          // r = 30 + pointBrightness;
          // g = 30 + pointBrightness;
          // b = 175 + pointBrightness;
        }
        else if (pointBrightness < 90){
          r = 255;
          g = (pointBrightness - 50) * 190 / 40 + 50;
          b = (pointBrightness - 50) * 240 / 40;
        }
        else{
          r  = 255 - (pointBrightness - 90) * 160 / 40;
          g = 240// - (pointBrightness - 90) * 10 / 40;
          b = 240;
        }

        groundGraphics.fill(r, g, b);
        // fill(pointBrightness * 255/100)

        groundGraphics.rect(x, y, 1);
        // rect(x, y + myHeight*mapScale + 10);
        // rect(mapScale*x, mapScale*y, Math.ceil(mapScale))
      }
    }

    image(groundGraphics, 0, 0);
  }
  else if (frameCount === 50){
    topoGraphics = createGraphics(mapScale*myWidth, mapScale*myHeight);
    topoGraphics.fill(0);
    topoGraphics.noStroke();
    for(let x = 0; x <= mapScale*myWidth; x++){
      for(let y = 0; y <= mapScale*myHeight; y++){
              
        drawTopoLine(x, y, 35);
      }
    }

    image(topoGraphics, 0, 0);
    image(topoGraphics, 0, 0);
  }
  else if (frameCount === 60){
    
    houseX = randRangeInt(50, mapScale*myWidth  - 50);
    houseY = randRangeInt(50, mapScale*myHeight - 50);
    playerGraphics = createGraphics(mapScale*myWidth, mapScale*myHeight);

    let numPeople = myWidth*myHeight/8000;
    console.log(numPeople);
    for(let i = 0; i < numPeople; i++){
      let x, y;
      do{
        x = randRangeInt(50, mapScale*myWidth  - 50);
        y = randRangeInt(50, mapScale*myHeight - 50);

      } while (groundPoints[Math.floor(x)][Math.floor(y)] < 50)

      if(randRange(0, 1) > 0.5){
        playerGraphics.fill(0, 200, 0);
      } else {
        playerGraphics.fill(255, 30, 30);
      }

      playerGraphics.stroke(0);
      playerGraphics.strokeWeight(1);
      playerGraphics.circle(x, y, 6);
    }

    for(let i = 0; i < 1; i++){
      let x, y;
      do{
        x = randRangeInt(myWidth/2, myWidth - 50);
        y = randRangeInt(120, myHeight - 120);

      } while (groundPoints[Math.floor(mapScale*(x))][Math.floor(mapScale*(y))] < 50)

      
      playerGraphics.strokeWeight(1);
      playerGraphics.stroke(0);
      playerGraphics.fill(255);
      playerGraphics.circle(x*mapScale, y*mapScale, 6);
      
      playerGraphics.stroke(0);
      playerGraphics.strokeWeight(2);

      let maxPoints, maxXOffset, maxYOffset;
      let maxHouseAngle, maxAngleIndex, maxAnglePoints, maxHeightPoints
      let maxX, maxY, previousX, previousY;
      let previousAngle = 4;

      let houseX = 0, houseY = mapScale*myHeight/2;

      let numLoops = 0, maxLoops = 1000;
      let distanceList = [];
      let houseAngle = Math.PI;
      while(x > 1 && x < mapScale*myWidth-1 && y > 1 && y < mapScale*myHeight-1 && numLoops < maxLoops){
        // distanceList.push(Math.abs(houseX - x) + Math.abs(houseY - y));
        maxPoints = -99;

        let angleIndex = 0;
        for(let xOffset = -1; xOffset <= 1; xOffset++){
          for(let yOffset = -1; yOffset <= 1; yOffset++){

            if(x + xOffset >= myWidth || x + xOffset < 0 || y + yOffset >= myHeight || y + yOffset < 0)
              continue;
            // if(groundPoints[Math.floor(mapScale*(x+xOffset))][Math.floor(mapScale*(y+yOffset))] < 50)
            //   continue;
  
            if(xOffset === -1){
              if    (yOffset === -1) angleIndex = 5;
              else if(yOffset === 0) angleIndex = 4;
              else if(yOffset === 1) angleIndex = 3;
            }
            else if(xOffset === 0){
              if    (yOffset === -1) angleIndex = 6;
              else if(yOffset === 0) continue;
              else if(yOffset === 1) angleIndex = 2;
            }
            else if(xOffset === 1){
              if    (yOffset === -1) angleIndex = 7;
              else if(yOffset === 0) angleIndex = 0;
              else if(yOffset === 1) angleIndex = 1;
            }
            if(Math.abs(angleIndex - previousAngle) > 1) continue;

            console.assert(!(xOffset === 0 && yOffset === 0));
  
            let trueHouseAngle = Math.atan2(houseY - (y+yOffset), houseX - (x+xOffset));
            houseAngle += randRange(-0.3, 0.3);
            houseAngle = (houseAngle - trueHouseAngle)*0.95 + trueHouseAngle;
            let anglePoints = houseAngle - 2*angleIndex*Math.PI/8;

            // let anglePointMultiplier = numLoops / maxLoops * 3 + 0.5;
            let angleMultiplier = 1;
            // if(distanceList.length > 1) 
            //   angleMultiplier = Math.max(1, 1 + distanceList[distanceList.length-1] - distanceList[distanceList.length-2])
            
            // console.log(angleMultiplier, distanceList[distanceList.length-1], distanceList[distanceList.length-10])
            anglePoints = angleMultiplier * (Math.PI - Math.abs(anglePoints));
  
            let heightPoints = 1 - Math.abs(perlinPoints[x+xOffset][y+yOffset] - perlinPoints[x][y]);
  
            if(anglePoints + heightPoints > maxPoints) {
              // console.log(anglePoints + heightPoints, maxPoints)
              maxPoints = anglePoints + heightPoints;
              maxAnglePoints  = anglePoints;
              maxHeightPoints = heightPoints;
              maxHouseAngle = houseAngle;
              maxAngleIndex = angleIndex
              maxX = x+xOffset;
              maxY = y+yOffset;
              maxXOffset = xOffset;
              maxYOffset = yOffset;
            }
          }
        }
        x = maxX;
        y = maxY;
        previousAngle = maxAngleIndex;

        let jitter1 = 0, jitter2 = 0;
        if(numLoops % 6 === 0) {
          // jitter1 = randRange(-3, 3);
          // jitter2 = randRange(-3, 3); 

          let drawnX = x*mapScale + jitter1;
          let drawnY = y*mapScale + jitter2;
          let midX = (drawnX + previousX)/2;
          let midY = (drawnY + previousY)/2;
          let traveledX = drawnX - midX;
          let traveledY = drawnY - midY;

          if(numLoops > 0) 
          {
            playerGraphics.line(midX - traveledX/4, midY - traveledY/4, midX + traveledX/4, midY + traveledY/4);
          }

          previousX = drawnX;
          previousY = drawnY;
        }
        numLoops++;

      }

    }

  }
  else if (runtime > runtimeForNextDisplay && frameCount > 70){
    // console.log(runtimeForNextDisplay, runtime);
    let newCanvas = createGraphics(mapScale*myWidth, mapScale*myHeight);
    
    newCanvas.image(groundGraphics, 0, 0);
    newCanvas.image(topoGraphics, 0, 0);
    newCanvas.image(playerGraphics, 0, 0);

    lakeHeightIndex++;
    establishNextRuntime = true;

    riverX = []
    riverY = []
    let maxLookRange = 6;
    for(let i = 0; i < 4; i++){

      let lowestX, lowestY, lowestValue = 999;
      for(let x = Math.floor(myWidth/2*(i%2 === 0)); x < myWidth/2 + myWidth/2*(i%2 === 0); x++){
        for(let y = Math.floor(myHeight/2*(i%4 > 1)); y < myHeight/2 + myHeight/2*(i%4 > 1); y++){
            if(perlinPoints[x][y] < lowestValue)  {
            lowestValue  = perlinPoints[x][y];
            lowestX = x;
            lowestY = y;
          } 
        }
      }

      makeRiver(i, lowestX, lowestY, maxLookRange);

      // startX = Math.floor(randRangeInt(0,  myWidth*1/2)  + myWidth/2*(i%2 === 0)); 
      // startY = Math.floor(randRangeInt(0, myHeight*1/2) + myHeight/2*(i%4 > 1));

    }

    for(let i in riverX){
      for(j = 2; j < riverX[i].length - 3; j++){

        let xCoord = mapScale*riverX[i][j];
        let yCoord = mapScale*riverY[i][j];
        let brightness = groundPoints[xCoord][yCoord];

        newCanvas.stroke(0 + brightness, 0 + brightness, 95 + 2*brightness)
        if(!isNumber(brightness)) stroke(50, 50, 200);

        newCanvas.strokeWeight(Math.max(Math.floor(5 * j / riverX[i].length), 2));

        let jitter1 = randRange(-1, 1);
        let jitter2 = randRange(-1, 1);
        let jitter3 = randRange(-1, 1);
        let jitter4 = randRange(-1, 1);
        newCanvas.line(
          mapScale*riverX[i][j] + jitter1,   mapScale*riverY[i][j] + jitter2, 
          mapScale*riverX[i][j-1] + jitter3, mapScale*riverY[i][j-1] + jitter4);
      }
    }

    lakeTilesX = [];
    lakeTilesY = [];
    lakeHeights = [];    
    let maxRiverLoops = riverX.length;
    for(let riverIndex = 0; riverIndex < maxRiverLoops; riverIndex++){

      let startX = riverX[riverIndex][riverX[riverIndex].length - 4]
      let startY = riverY[riverIndex][riverY[riverIndex].length - 4]
      startX = startX - startX % lakeScale;
      startY = startY - startY % lakeScale;

      let lakeHeight = perlinPoints[startX][startY] + addedLakeHeights[lakeHeightIndex % addedLakeHeights.length];
      lakeHeights.push(lakeHeight);
      // console.log(addedLakeHeights[lakeHeightIndex % lakeHeights.length], lakeHeightIndex)

      let workingLakeX = [startX];
      let workingLakeY = [startY];
      lakeTilesX.push([startX]);
      lakeTilesY.push([startY]);

      let numLoops = 0;
      while(workingLakeX.length > 0 && numLoops < 50000){
        numLoops++;

        let x = workingLakeX[0];
        let y = workingLakeY[0];
        workingLakeX.shift();
        workingLakeY.shift();
        
        let numPushes = 0;
        for(let xOffset = -lakeScale; xOffset <= lakeScale; xOffset += lakeScale){
          for(let yOffset = -lakeScale; yOffset <= lakeScale; yOffset += lakeScale){
            
            if(xOffset != 0 && yOffset != 0 || xOffset === 0 && yOffset === 0) continue;
            if(x + xOffset >= myWidth || x + xOffset < 0 || y + yOffset >= myHeight || y + yOffset < 0)
              continue;
            
            let alreadyLake = false;
            for(let i in lakeTilesX){
              for(let j in lakeTilesX[i]){
                if(lakeTilesX[i][j] === x + xOffset && lakeTilesY[i][j] === y + yOffset) {
                  if(lakeHeights[i] < lakeHeight){
                    lakeHeights.splice(i, 1);
                    lakeTilesX.splice(i, 1);
                    lakeTilesY.splice(i, 1);
                    riverX.splice(i, 1);
                    riverY.splice(i, 1);
                    riverIndex--;
                    maxRiverLoops--;  
                  }
                  alreadyLake = true;
                }
              }
            }
            if(alreadyLake) continue;

            // console.log(x+xOffset, y+yOffset)
            if(perlinPoints[x+xOffset][y+yOffset] < lakeHeight) {
              // console.log(x, y, perlinPoints[x][y]); 
              workingLakeX.push(x+xOffset);
              workingLakeY.push(y+yOffset);
              
              lakeTilesX[riverIndex].push(  x+xOffset);
              lakeTilesY[riverIndex].push(  y+yOffset);
              numPushes++;
            }
          }
        }
      }

    }

    // for(let i in lakeTilesX){
    //   lakeEdgeX.push([]);
    //   lakeEdgeY.push([]);

    //   for(let j in lakeTilesX[i]){
         
    //     if(!isLakeSurrounded(lakeTilesX[i][j], lakeTilesY[i][j])){
    //       // console.log("Edge!");
    //       // console.log(lakeEdgeX, i, lakeEdgeX[i], lakeTilesX[i], i1, lakeTilesX[i][i1]);
    //       lakeEdgeX[i].push(lakeTilesX[i][j]);
    //       lakeEdgeY[i].push(lakeTilesY[i][j]);
    //     }
    //   }
    // }

    newCanvas.noStroke()
    for(let i in lakeTilesX){
      // let lakeHeight = lakeHeights[i] - 150 + (frameCount-60)*30;
      let lakeHeight = lakeHeights[i] - 7;

      for(let j in lakeTilesX[i]){
  
        let xCoord = mapScale*lakeTilesX[i][j];
        let yCoord = mapScale*lakeTilesY[i][j];
        noStroke();
  
        // let isLakeEdge = false;
        // for(let i1 in lakeEdgeX){
        //   for(let j1 in lakeEdgeX[i1]){
        //     if(lakeEdgeX[i1][j1] === lakeTilesX[i][j] && lakeEdgeY[i1][j1] === lakeTilesY[i][j]) 
        //       isLakeEdge = true;

        //   }
        // }

        // if(trueGroundPoints[xCoord][yCoord] < lakeHeight-25){
        //   let brightness = trueGroundPoints[xCoord][yCoord];
        //   brightness = (brightness - lowestValue) / (highestValue - lowestValue) * (100-20) + 20;

        //   rect(xCoord - lakeScale*mapScale/2, yCoord - lakeScale*mapScale/2, lakeScale*mapScale)
        // }
        
        for(let x = xCoord - lakeScale*mapScale/2; x < xCoord + lakeScale*mapScale/2; x+=2){
          for(let y = yCoord - lakeScale*mapScale/2; y < yCoord + lakeScale*mapScale/2; y+=2){

            if(x < 0 || x >= mapScale*myWidth || y < 0 || y >= mapScale*myHeight) continue;
            let xOffset = -(xCoord - x - lakeScale*mapScale/2) / (lakeScale*mapScale);
            let yOffset = -(yCoord - y - lakeScale*mapScale/2) / (lakeScale*mapScale);

            let brightness = trueGroundPoints[x][y];
            brightness = (brightness - lowestValue) / (highestValue - lowestValue) * (100-20) + 20;
            
            newCanvas.fill(brightness, 20 + brightness, 100 + 1.5*brightness);

            // fill("green")

            if(trueGroundPoints[x][y] < lakeHeight){
              newCanvas.rect(x, y, 2);
            }
          }
        }
      }
    }

    newCanvas.image(topoGraphics, 0, 0);

    newCanvas.push();
    newCanvas.tint(255, 70);
    newCanvas.image(playerGraphics, 0, 0);
    newCanvas.pop();


    image(newCanvas, 0, 0);
    

    noStroke()
    fill(227, 132, 53);
    rect(houseX, houseY, 20, 10);
    fill(161, 86, 23);
    rect(houseX, houseY+10, 20, 10);
    noFill();
    stroke(0);
    strokeWeight(1);
    rect(houseX, houseY, 20, 20);

    image(compassImage, width - compassImage.width - 20, 20)

    finalizedGraphics.push(newCanvas);
    
  }
  
}

function drawTopoLine(x, y, opacity){

  let myBrightness = groundPoints[x][y];


  for(let xOffset = -1; xOffset <= 1; xOffset++){
    for(let yOffset = -1; yOffset <= 1; yOffset++){

      if(x+xOffset < 0 || y+yOffset < 0 || x+xOffset >= mapScale*myWidth-1 || y+yOffset >= mapScale*myHeight-1) continue;
      if(xOffset != 0 && yOffset != 0) continue;

      let otherBrightness = groundPoints[x+xOffset][y+yOffset];
      
      if(myBrightness != otherBrightness && myBrightness < otherBrightness) {

        if(Math.floor(myBrightness/topoDensity) % fancyTopoDensity === 0) opacity *= 2;

        let pixelIndex = 4*(x + width*y);
        // if(pixels[pixelIndex] + 80 < pixels[pixelIndex+2]) opacity = 0;


        topoGraphics.fill(0, 0, 0, opacity);
        // fill(r, g, b);
      
        topoGraphics.rect(x, y, 1);
        return true;
      }
    }
  }

  return false;
}

function perlinify(oldPoints, trueX, trueY){
  let sumOfPoints = 0;
  let numPointsInSum = 0;
  for(let y = trueY-perlinScale; y <= trueY+perlinScale; y++){
    for(let x = trueX-perlinScale; x <= trueX+perlinScale; x++){

      if(y < 0 || x < 0) continue;
      if(y >= myHeight || x >= myWidth) continue;
      if(oldPoints[x][y] === "no data") continue;
      console.assert(isNumber(oldPoints[x][y]), x, y, oldPoints[x][y]);

      numPointsInSum++;
      sumOfPoints += oldPoints[x][y];
    }
  }
  console.assert(numPointsInSum != 0)
  sumOfPoints /= numPointsInSum;

  return sumOfPoints;
}

function isLakeSurrounded(x, y){

  let amountSurrounded = 0;
  let visionSize = 2;

  for(let xOffset = -visionSize; xOffset <= visionSize; xOffset++){
    for(let yOffset = -visionSize; yOffset <= visionSize; yOffset++){
  
      for(let i in lakeTilesX){
        for(let j in lakeTilesX[i]){
    
          if(x + xOffset*lakeScale === lakeTilesX[i][j] && y + yOffset*lakeScale === lakeTilesY[i][j]){
            amountSurrounded++;
          }
        }
      }
    }
  }

  return amountSurrounded === Math.pow(2*visionSize+1, 2) || amountSurrounded === Math.pow(2*visionSize+1, 2) - 1;
}

function makeRiver(index, startX, startY, maxLookRange){
  riverX.push([]);
  riverY.push([]);
  let pathX = startX, pathY = startY;

  let loopingIndex = 0;
  while(loopingIndex < 100000){
    loopingIndex++;

    let lowestChange = 0, lowestNearX, lowestNearY;

    for(let lookRange = 1; lookRange <= maxLookRange; lookRange++){
      for(let xOffset = -lookRange; xOffset <= lookRange; xOffset++){
        for(let yOffset = -lookRange; yOffset <= lookRange; yOffset++){
          if(pathX + xOffset >= myWidth || pathX + xOffset < 0 || pathY + yOffset >= myHeight || pathY + yOffset < 0)
            continue;

          // console.log(pathX, pathY, xOffset, yOffset, parseInt(pathX+xOffset), parseInt(pathY+yOffset));
          if(perlinPoints[pathX][pathY] - perlinPoints[pathX+xOffset][pathY+yOffset] > lowestChange){
            lowestChange = perlinPoints[pathX][pathY] - perlinPoints[pathX+xOffset][pathY+yOffset];
            lowestNearX = pathX+xOffset;
            lowestNearY = pathY+yOffset;
          }
        }
      }
      if(lowestChange != 0) break;
    }
    if(lowestChange === 0) break;

  
    pathX = lowestNearX;
    pathY = lowestNearY;
    riverX[index].push(pathX);
    riverY[index].push(pathY);
    
  }
  
  loopingIndex = 0;
  pathX = startX, pathY = startY;
  while(loopingIndex < 100000){
    loopingIndex++

    let highestChange = 0, highestNearX, highestNearY;

    for(let lookRange = 1; lookRange <= maxLookRange; lookRange++){
      for(let xOffset = -lookRange; xOffset <= lookRange; xOffset++){
        for(let yOffset = -lookRange; yOffset <= lookRange; yOffset++){
          
          if(pathX + xOffset >= myWidth || pathX + xOffset < 0 || pathY + yOffset >= myHeight || pathY + yOffset < 0)
            continue;

          if(perlinPoints[pathX+xOffset][pathY+yOffset] - perlinPoints[pathX][pathY] > highestChange){
            highestChange = perlinPoints[pathX+xOffset][pathY+yOffset] - perlinPoints[pathX][pathY];
            highestNearX = pathX+xOffset;
            highestNearY = pathY+yOffset;
          }
        }
      }
      if(highestChange != 0) break;
    }
    if(highestChange === 0) break;

    pathX = highestNearX;
    pathY = highestNearY;
    riverX[index].unshift(pathX);
    riverY[index].unshift(pathY);
  }
}


function mousePressed(){
  mouseJustPressed = true;
  mouseIsDown = true;
  return false;
}

function mouseReleased(){
  mouseIsDown = false;
  return false;
}