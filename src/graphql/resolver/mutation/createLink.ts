import { FieldResolver } from 'nexus';
import * as yup from 'yup';
import { AuthenticationFailedError } from '../../error/AuthenticationFailedError';
import { ValidationError } from '../../error/ValidationError';
import { createLinkValidation } from '../../validation/createLinkValidation';

export const createLink = ((_parent, args, { prisma, userId }) => {
  if (!userId) throw new AuthenticationFailedError();

  const user = prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new AuthenticationFailedError();

  try {
    createLinkValidation.validateSync(args, { abortEarly: false });

    return prisma.link.create({
      data: {
        ...args,
        postedBy: {
          connect: { id: userId },
        },
      },
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      throw new ValidationError(error.errors);
    }

    throw error;
  }
}) as FieldResolver<'Mutation', 'createLink'>;
