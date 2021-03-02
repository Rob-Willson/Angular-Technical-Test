export class ColorRGBA{
  public readonly r: number;
  public readonly g: number;
  public readonly b: number;
  public a: number;
  public readonly descriptor: string;
  public asString: string;

  constructor(
    r: number,
    g: number,
    b: number,
    a: number,
    descriptor: string,
  )
  {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.descriptor = descriptor;
    this.asString = this.toString();
  }

  private toString(): string {
    return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
  }

  private setAlpha(newAlpha: number): void {
    this.a = Math.min(Math.max(newAlpha, 0), 1.0);
    this.asString = this.toString();
  }

}
