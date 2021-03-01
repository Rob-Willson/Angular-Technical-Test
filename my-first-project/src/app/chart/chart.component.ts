import { Component, OnInit } from "@angular/core";
import { HttpService } from "../core/http.service";
import { CryptoData } from "../core/data.template";
import { Coin } from "../core/coin.template";
import * as d3 from "d3";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})

export class ChartComponent implements OnInit {
  private readonly urlBase: string = "https://min-api.cryptocompare.com/data/v2/histoday";
  private urlCurrencyId: string = "BTC";
  private urlCurrencyStandardId: string = "USD";
  private urlCount: number = 90;
  // TODO: API key?

  private svg;
  private margin: number = 50;
  private width: number = 800 - (this.margin * 2);
  private height: number = 400 - (this.margin * 2);

  // All supported crytocurrencies with their default display values
  public coins: Coin[] = Coin.GetAllCoins();

  constructor(private httpService : HttpService) {}

  ngOnInit(): void {
    this.createSvg();
    this.updatePlot();
  }

  private buildUrl() : string {
    let url : string = this.urlBase + "?";
    // Request requires a querying currency (fsym) and a standard (tsym) to compare it with
    url += "fsym=" + this.urlCurrencyId + "&";
    url += "tsym=" + this.urlCurrencyStandardId;
    url += "&limit=" + (this.urlCount);
    // TODO:
    //url += "&api_key=" + "{key}";
    return url;
  }

  updatePlot(): void {
    this.httpService.getRequestObservable(this.buildUrl()).subscribe((data) => {
      console.log("RAW DATA: ");
      console.log(data);
      let dataProcessedFromObservable = CryptoData.parseFromJSON(data);
      this.drawPlot(dataProcessedFromObservable);
    });
  }

  private createSvg(): void {
    // Clean up any existing chart
    d3.select("svg").remove();

    this.svg = d3
    .select("figure#bar")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawPlot(data: CryptoData[]): void {
    // Create the X-axis band scale
    // TODO: This has a weird cast. It"s required because d3.min/max don"t support returning undefined
    const x = d3
    .scaleTime()
    .domain([d3.min(data, d => d.time) as number, d3.max(data, d => d.time) as number])
    .range([0, this.width]);

    // Create the Y-axis band scale
    // TODO: This has a weird cast. It"s required because d3.min/max don"t support returning undefined
    const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.average()) as number])
    .range([this.height, 0]);

    // Draw the X-axis on the DOM
    this.svg
    .append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Draw the Y-axis on the DOM
    this.svg
    .append("g")
    .call(d3.axisLeft(y));

    this.plotData(x, y, data);
  }

  private plotData(x, y, data: CryptoData[]): void {
    // Draw the lines
    const points: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.average())]
    );
    this.svg
      .append("g")
      .append("path")
      .attr("id", "line")
      .style("fill", "none")
      .style("stroke", "rgba(70, 130, 180, 1)")
      .style("stroke-width", "2.5px")
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(d => d[0])
        .y(d => d[1])(points));
    
    const pointsHighs: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.high)]
    );
    this.svg
      .append("g")
      .append("path")
      .attr("id", "line")
      .style("fill", "none")
      .style("stroke", "rgba(70, 130, 180, 1)")
      .style("stroke-width", "1.5px")
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(d => d[0])
        .y(d => d[1])(pointsHighs));

    const pointsLows: [number, number][] = data.map(
      d => [x(new Date(d.time)), y(d.low)]
    );
    this.svg
      .append("g")
      .append("path")
      .attr("id", "line")
      .style("fill", "none")
      .style("stroke", "rgba(70, 130, 180, 1)")
      .style("stroke-width", "1.5px")
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(d => d[0])
        .y(d => d[1])(pointsLows));     

    const pointsArea: [number, number][] = pointsHighs.concat(pointsLows.reverse());
    var areaFunction = d3.area()
    .curve(d3.curveBasis)
    .x(d => d[0])
    .y1(d => d[1])
    .y0(0);

    this.svg
      .append("path")
      .attr("fill", "rgba(70, 130, 180, 0.2)")
      .attr("d", areaFunction(pointsArea));  

    // Plot the dots
    // this.svg.append("g")
    // .selectAll("dot")
    // .data(data)
    // .enter()
    // .append("circle")
    // .attr("cx", d => x(d.time))
    // .attr("cy", d => y(d.average()))
    // .classed("chart-point", true);

  }

  onSelectCoin(coinId: any) {
    console.log("onSelectCoin(" + coinId + ") CALLED");

    this.coins.forEach(coin => {
      if(coinId == coin.id) {
        coin.active = !coin.active;
      }
    });

    let logMessage: string = "";
    this.coins.forEach(coin => {
      logMessage += coin.id + ": " + coin.active + ", ";
    });
    console.log(logMessage);
  }

}
