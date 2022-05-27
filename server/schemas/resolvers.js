const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, params) => {
            if (params.user) {
                const userData = await User.findOne({ _id: params.user._id })
                    .select('-__v -password');
                return userData
            }
            throw new AuthenticationError('You must be logged in')
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError("Can't find this user");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Wrong Password!')
            }
            const token = signToken(user);
            return { token, user }
        },
        saveBook: async (parent, { bookData }, params) => {
            if (params.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: params.user._id },
                    { $pull: { savedBooks: bookData } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Login Required!');
        },
        removeBook: async (parent, { bookId }, params) => {
            if (params.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: params.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Login Required!');
        }
    },
};

module.exports = resolvers;