export type TransformOptions = {
  /** gets node names if you want to debug transformation */
  debug?: boolean;
  /** added primitive types information of class parameters, to debug if there is something went wrong */
  addDetailsToUnknownParameters?: boolean;
  /** adds console.debug call before saveConstructorMetadata function call. Useful to get debug information trace */
  logClassNames?: boolean;
};
